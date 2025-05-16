import React, { useState, useEffect, useRef } from 'react';
import { shuffleArray } from '../utils';
import usePersistentToggle from './usePersistentToggle';

// Noodzakelijk voor de dynamische titel en andere UI elementen
const levelLabels = {
  all: 'Alle Niveaus',
  level1: 'Niveau 1 (Beginner)',
  level2: 'Niveau 2 (Gevorderd)',
  level3: 'Niveau 3 (Expert)',
  level1_2: 'Niveau 1 & 2',
};

// Zet de gewenste volgorde van de filterknoppen
const levelOrder = ['level1', 'level2', 'level3', 'level1_2', 'all'];

function TermenSection({ initialFlashcards, assessments, onAssessmentsChange, onRepeatCountsChange, initialFlashcardRepeats, kennisBoosterTitel }) {
  const [levelFilter, setLevelFilter] = useState(''); // standaard leeg
  const [activeFlashcards, setActiveFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showIntro, toggleIntro] = usePersistentToggle('begrippen_trainer_intro', true);
  const [repeatCounts, setRepeatCounts] = useState(initialFlashcardRepeats || {});
  const [showRepeatDone, setShowRepeatDone] = useState(false);
  const [reviewedThisRound, setReviewedThisRound] = useState([]);
  const [cardSideFilter, setCardSideFilter] = useState('both'); // 'both', 'normal', 'reverse'
  const [infoOpen, setInfoOpen] = useState(false);
  const infoRef = useRef();

  // Initialiseer repeatCounts alleen bij mount en reset
  useEffect(() => {
    setRepeatCounts(initialFlashcardRepeats || {});
    setShowRepeatDone(false);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  }, [initialFlashcardRepeats]);

  // Deze effect hook beheert de set kaarten die getoond wordt in de normale leermodus.
  useEffect(() => {
    if (!isReviewing) {
      let cardsToDisplay = [];
      const validInitialFlashcards = Array.isArray(initialFlashcards) ? initialFlashcards : [];

      // Maak een uitgebreide lijst met zowel normale als reverse kaarten
      const expandedFlashcards = validInitialFlashcards.flatMap(card => {
        const cards = [];
        
        // Voeg altijd de normale versie toe
        cards.push({
          ...card,
          isReverse: false
        });
        
        // Als de kaart reverse is, voeg ook de reverse versie toe
        if (card.reverse) {
          cards.push({
            ...card,
            id: `${card.id}_reverse`,
            isReverse: true
          });
        }
        
        return cards;
      });

      // Filter op kaartzijde
      let filteredBySide = expandedFlashcards;
      if (cardSideFilter === 'normal') {
        filteredBySide = expandedFlashcards.filter(card => !card.isReverse);
      } else if (cardSideFilter === 'reverse') {
        filteredBySide = expandedFlashcards.filter(card => card.isReverse);
      }

      switch (levelFilter) {
        case 'level1':
          cardsToDisplay = filteredBySide.filter(card => card && card.level === 1);
          break;
        case 'level2':
          cardsToDisplay = filteredBySide.filter(card => card && card.level === 2);
          break;
        case 'level3':
          cardsToDisplay = filteredBySide.filter(card => card && card.level === 3);
          break;
        case 'level1_2':
          cardsToDisplay = filteredBySide.filter(card => card && (card.level === 1 || card.level === 2));
          break;
        case 'all':
        default:
          cardsToDisplay = [...filteredBySide];
          break;
      }
      setActiveFlashcards(shuffleArray(cardsToDisplay));
      setCurrentCardIndex(0);
      setShowAnswer(false);
      setReviewedThisRound([]);
      setShowRepeatDone(false);
    }
  }, [initialFlashcards, levelFilter, isReviewing, cardSideFilter]);

  // Click-away listener voor popover
  useEffect(() => {
    if (!infoOpen) return;
    function handleClick(event) {
      if (infoRef.current && !infoRef.current.contains(event.target)) {
        setInfoOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [infoOpen]);

  const handleAssessment = (cardId, assessmentLevel) => {
    const baseId = cardId.endsWith('_reverse') ? cardId.replace('_reverse', '') : cardId;
    onAssessmentsChange({ ...assessments, [cardId]: assessmentLevel });
    
    // Update herhalingen en stuur direct naar parent
    const newRepeatCounts = { 
      ...repeatCounts, 
      [cardId]: (repeatCounts[cardId] || 0) + 1 
    };
    setRepeatCounts(newRepeatCounts);
    onRepeatCountsChange(newRepeatCounts);
    
    if (isReviewing) {
      setReviewedThisRound(prev => prev.includes(cardId) ? prev : [...prev, cardId]);
    }
    
    setTimeout(() => {
      const nextIndex = (currentCardIndex + 1) % activeFlashcards.length;
      
      // Check of we een complete ronde hebben gedaan
      if (nextIndex === 0) {
        setShowRepeatDone(true);
        return;
      }
      
      setShowAnswer(false);
      setCurrentCardIndex(nextIndex);
    }, 200);
  };

  const goToNextCard = () => {
    if (activeFlashcards.length === 0) return;
    setShowAnswer(false);
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % activeFlashcards.length);
  };

  const goToPreviousCard = () => {
    if (activeFlashcards.length === 0) return;
    setShowAnswer(false);
    setCurrentCardIndex((prevIndex) => (prevIndex - 1 + activeFlashcards.length) % activeFlashcards.length);
  };

  const toggleAnswer = () => setShowAnswer(!showAnswer);
  const currentCard = activeFlashcards[currentCardIndex];

  const generateChatGPTLink = () => {
    if (!currentCard) return '';
    const prompt = `Jij bent een excellente docent fysiotherapie. Leg duidelijk en begrijpelijk uit wat de term "${currentCard.term}" betekent in de context van ${kennisBoosterTitel} binnen de fysiotherapie. Licht de functie of rol van deze term toe, leg uit waarom het relevant is in de praktijk, en geef indien mogelijk een concreet voorbeeld of toepassing.

Sluit af met een uitnodiging tot verdere verdieping: vraag wat de student nog lastig vindt aan het begrip, bied aan het op een andere manier uit te leggen (bijvoorbeeld met een metafoor of voorbeeld), of stel een verwante term voor om verder te verkennen.`;
    return `https://chat.openai.com/?q=${encodeURIComponent(prompt)}`;
  };

  // Helper: Haal de kaarten op die overeenkomen met het huidige levelFilter
  const getCardsForCurrentLevelFilter = () => {
    const validInitialFlashcards = Array.isArray(initialFlashcards) ? initialFlashcards : [];
    if (levelFilter === 'all') return [...validInitialFlashcards];
    return validInitialFlashcards.filter(card => {
      if (!card) return false;
      if (levelFilter === 'level1') return card.level === 1;
      if (levelFilter === 'level2') return card.level === 2;
      if (levelFilter === 'level3') return card.level === 3;
      if (levelFilter === 'level1_2') return card.level === 1 || card.level === 2;
      return false;
    });
  };

  const startReview = (assessmentFilterType) => {
    const cardsToConsiderForReview = getCardsForCurrentLevelFilter();
    let filteredForReviewSession = [];

    switch (assessmentFilterType) {
      case 'Niet':
        filteredForReviewSession = cardsToConsiderForReview.filter(card => card && assessments[card.id] === 'Niet');
        break;
      case 'Redelijk':
        filteredForReviewSession = cardsToConsiderForReview.filter(card => card && assessments[card.id] === 'Redelijk');
        break;
      case 'Niet_Redelijk':
        filteredForReviewSession = cardsToConsiderForReview.filter(card => card && (assessments[card.id] === 'Niet' || assessments[card.id] === 'Redelijk'));
        break;
      default: // 'Alles' (alle beoordeelde kaarten binnen het huidige filter)
        filteredForReviewSession = cardsToConsiderForReview.filter(card => card && assessments[card.id]);
    }

    if (filteredForReviewSession.length > 0) {
      setIsReviewing(true);
      setActiveFlashcards(shuffleArray(filteredForReviewSession));
      setCurrentCardIndex(0);
      setShowAnswer(false);
      setReviewedThisRound([]);
      setShowRepeatDone(false);
    } else {
      alert(`Geen kaarten gevonden voor deze review selectie ${levelFilter !== 'all' ? `binnen ${levelLabels[levelFilter]}` : 'van alle beoordeelde kaarten'}.`);
    }
  };

  const startOriginalSet = () => {
    setIsReviewing(false); // Triggert de useEffect hierboven om te filteren op levelFilter
  };

  // Bepaal de kaarten voor het huidige actieve level filter (voor normale modus)
  const cardsInCurrentLearningSet = !isReviewing ? activeFlashcards : getCardsForCurrentLevelFilter();
  
  // Zijn alle kaarten in de HUIDIGE LEERSET (gefilteredd op level) beoordeeld?
  const allCardsInCurrentSetAssessed = cardsInCurrentLearningSet.length > 0 && cardsInCurrentLearningSet.every(card => card && assessments[card.id]);

  // Statistieken en tellingen voor de huidige set/filter
  const getStatistics = (cards) => {
    const stats = {
      goed: 0,
      redelijk: 0,
      niet: 0,
      totaal: 0,
      nietBeoordeeld: 0
    };
    
    cards.forEach(card => {
      const assessment = assessments[card.id];
      if (assessment) {
        switch(assessment) {
          case 'Goed': stats.goed++; break;
          case 'Redelijk': stats.redelijk++; break;
          case 'Niet': stats.niet++; break;
        }
        stats.totaal++;
      } else {
        stats.nietBeoordeeld++;
      }
    });
    
    return stats;
  };

  const cardsForCurrentFilterForCounts = getCardsForCurrentLevelFilter();
  const currentStats = getStatistics(cardsForCurrentFilterForCounts);
  const activeStats = getStatistics(activeFlashcards);
  
  const countNeeInFilter = currentStats.niet;
  const countNeeRedelijkInFilter = currentStats.niet + currentStats.redelijk;
  const countAssessedInFilter = currentStats.totaal;

  // Fallback UI als er geen kaarten zijn
  if (!currentCard && activeFlashcards.length === 0) {
    let message = initialFlashcards && initialFlashcards.length > 0 
        ? `Geen flashcards beschikbaar voor ${levelLabels[levelFilter]}. Probeer een ander niveau.`
        : "Er zijn nog geen flashcards ingeladen.";
    if (isReviewing) {
        message = `Geen kaarten gevonden voor deze herhaling ${levelFilter !== 'all' ? `binnen ${levelLabels[levelFilter]}` : 'van alle beoordeelde kaarten'}.`;
    }

    return (
      <div className="space-y-6">
        {/* Filter UI (altijd tonen als er een probleem is) */}
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Filter op Niveau</h3>
          <div className="flex flex-wrap gap-2">
            {levelOrder.map(levelKey => (
              <button
                key={levelKey}
                onClick={() => { setLevelFilter(levelKey); setIsReviewing(false); }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${levelFilter === levelKey && !isReviewing
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {levelLabels[levelKey]}
              </button>
            ))}
          </div>
        </div>
        <p className="text-center text-gray-700 mb-4">{message}</p>
        {isReviewing && (
          <button
            onClick={startOriginalSet} // Gaat terug naar leermodus, respecteert actieve levelFilter
            className="block mx-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out shadow"
          >
            Terug naar Leermodus
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Introductie */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-blue-700 mb-2">Begrippen Trainer</h2>
        <div className="mb-4">
          <button
            className="text-blue-700 font-semibold mb-2 focus:outline-none flex items-center gap-2"
            onClick={toggleIntro}
            aria-expanded={showIntro}
            aria-controls="begrippen-intro"
          >
            {showIntro ? '▼' : '►'} Inleiding
          </button>
          {showIntro && (
            <div id="begrippen-intro" className="bg-blue-50 p-6 rounded-lg shadow-sm">
              <p className="text-gray-700 leading-relaxed">
                De Begrippen Trainer helpt je om de belangrijkste termen en concepten rondom bindweefselherstel eigen te maken. Gebruik de filters hieronder om op kaartzijde en/of het niveau naar keuze te oefenen.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filter UI (alleen als niet in review) */}
      {!isReviewing && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Filter op Niveau</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {levelOrder.map(levelKey => (
              <button
                key={levelKey}
                onClick={() => setLevelFilter(levelKey)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${levelFilter === levelKey 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                disabled={levelKey === ''}
              >
                {levelLabels[levelKey]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center mt-2 relative">
            <span className="font-semibold text-gray-700 mr-2">Kaartzijde:</span>
            <button
              type="button"
              onClick={() => setInfoOpen((v) => !v)}
              className="rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 w-7 h-7 flex items-center justify-center border border-blue-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mr-2"
              aria-label="Uitleg kaartzijde filter"
              ref={infoRef}
            >
              <span className="text-lg font-bold">i</span>
            </button>
            {infoOpen && (
              <div className="absolute left-0 top-10 z-20 bg-white border border-blue-300 rounded-lg shadow-lg p-4 w-80 text-sm text-gray-800 animate-fadeIn">
                <strong className="block mb-2 text-blue-700">Uitleg kaartzijde filter</strong>
                <ul className="list-disc pl-5 mb-2">
                  <li><b>Voorkant → achterkant</b>: Je ziet de term en oefent vooral de betekenis van het begrip.</li>
                  <li><b>Achterkant → voorkant</b>: Je ziet de uitleg en oefent vooral het onthouden van de termnaam zelf.</li>
                  <li><b>Beide kanten</b>: Je oefent beide varianten door elkaar voor diepgaand leren.</li>
                </ul>
                <span className="text-xs text-gray-500">Klik buiten dit venster of op het i-tje om te sluiten.</span>
              </div>
            )}
            <button
              onClick={() => setCardSideFilter('both')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${cardSideFilter === 'both' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Beide kanten
            </button>
            <button
              onClick={() => setCardSideFilter('normal')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${cardSideFilter === 'normal' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Alleen voorkant → achterkant
            </button>
            <button
              onClick={() => setCardSideFilter('reverse')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${cardSideFilter === 'reverse' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Alleen achterkant → voorkant
            </button>
          </div>
        </div>
      )}
      
      {/* Hoofdsectie Trainer */}
      {levelFilter ? (
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-blue-700">
            {isReviewing 
              ? <span className="font-bold text-red-600">Herhaling {levelFilter !== 'all' ? `(${levelLabels[levelFilter]})` : '(Alle Beoordeelde)'}: Kaart {currentCardIndex + 1}/{activeFlashcards.length}</span> 
              : `Oefenen: ${levelLabels[levelFilter]} (Kaart ${currentCardIndex + 1}/${activeFlashcards.length})`}
          </h2>
          
          {/* Stappen & Tips */}
          <div className="mb-4">
            <button
              className="text-blue-700 font-semibold mb-2 focus:outline-none"
              onClick={() => setShowInstructions((prev) => !prev)}
               aria-expanded={showInstructions}
               aria-controls="flashcard-instructions"
            >
              {showInstructions ? '▼' : '►'} Bekijk de stappen
            </button>
            {showInstructions && (
              <div id="flashcard-instructions" className="bg-blue-50 p-6 rounded-lg shadow-sm mt-2">
                <strong>Stappen:</strong>
                <ol className="list-decimal ml-5 mt-2 space-y-1">
                  {!isReviewing && <li>Selecteer eerst een niveau hierboven.</li>}
                  <li>Kijk goed naar de kaart. Soms zie je de term, soms de uitleg. Probeer zélf het juiste antwoord te bedenken.</li>
                  <li>Neem de tijd om goed na te denken! Het is juist goed als het even moeilijk voelt - dat zijn de momenten waarop je brein nieuwe verbindingen aanlegt. Voel je dat het antwoord ergens zit maar kom je er net niet bij? Blijf even nadenken voordat je de kaart omdraait.</li>
                  <li>Klik op 'Toon Antwoord'.</li>
                  <li>Beoordeel eerlijk hoe goed je het wist.</li>
                  {allCardsInCurrentSetAssessed && !isReviewing && <li>Alle kaarten van dit niveau beoordeeld? Kies hieronder of je specifieke kaarten wilt herhalen.</li>}
                  {isReviewing && <li>Herhaal de kaarten die je nog niet goed kent.</li>}
                </ol>
                <p className="mt-2 text-blue-700"><b>Let op:</b> Sommige kaarten zijn omgedraaid (blauwe achtergrond). Je ziet dan eerst de uitleg en moet de term raden!</p>
                <div className="mt-4 p-4 bg-yellow-100 rounded-lg border-l-4 border-yellow-500">
                  <p className="text-yellow-900">
                    <span className="font-bold">Tip:</span> Het voelt misschien ongemakkelijk om even te wachten met het omdraaien van de kaart, maar dit is juist cruciaal voor diep leren. Deze momenten van 'bijna weten' zijn de krachtigste momenten voor je langetermijngeheugen. Geef je brein de tijd om de verbindingen te maken!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Flashcard zelf - alleen tonen als we niet klaar zijn met de set */}
          {currentCard && !showRepeatDone && (
            <div className={`border p-6 rounded-lg shadow-md min-h-[200px] flex flex-col justify-between items-center mb-4 relative ${currentCard.reverse ? 'bg-blue-50 border-blue-400' : 'bg-yellow-50 border-yellow-400'}`}>
              {/* Status indicator (eerste keer of aantal herhalingen) */}
              <div className="absolute top-2 right-2 text-sm">
                {repeatCounts[currentCard.id] > 0 ? (
                  <span className="text-blue-600 font-medium">
                    Herhaald: {repeatCounts[currentCard.id]}×
                  </span>
                ) : (
                  <span className="text-green-600 font-medium">
                    Eerste keer
                  </span>
                )}
              </div>
              {currentCard.reverse ? (
                <>
                  <div className="flex-grow flex flex-col items-center justify-center w-full">
                    <p className="text-gray-700 text-center mb-4">{currentCard.definition}</p>
                    {showAnswer ? (
                      <p className="text-xl font-bold text-gray-800 text-center">{currentCard.term}</p>
                    ) : (
                      <button
                        onClick={toggleAnswer}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out shadow"
                      >
                        Toon Antwoord
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold text-gray-800 text-center mb-4">{currentCard.term}</p>
                  <div className="flex-grow flex items-center justify-center w-full">
                    {showAnswer ? (
                      <p className="text-gray-700 text-center">{currentCard.definition}</p>
                    ) : (
                      <button
                        onClick={toggleAnswer}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out shadow"
                      >
                        Toon Antwoord
                      </button>
                    )}
                  </div>
                </>
              )}
              {showAnswer && (
                <>
                  <div className="mt-4 flex flex-col items-center">
                    <p className="text-sm text-gray-600 mb-2">Hoe goed kende je dit?</p>
                    <div className="flex flex-wrap justify-center items-center space-x-3">
                      {['Niet', 'Redelijk', 'Goed'].map(assessmentType => (
                         <button
                            key={assessmentType}
                            onClick={() => handleAssessment(currentCard.id, assessmentType)}
                            className={`text-white text-sm font-medium py-1 px-3 rounded-md transition duration-150 ease-in-out shadow mb-2 sm:mb-0 ${
                              assessments[currentCard.id] === assessmentType
                                ? assessmentType === 'Niet' ? 'bg-red-700 ring-2 ring-offset-1 ring-red-700' 
                                : assessmentType === 'Redelijk' ? 'bg-yellow-700 ring-2 ring-offset-1 ring-yellow-700'
                                : 'bg-green-700 ring-2 ring-offset-1 ring-green-700'
                                : assessmentType === 'Niet' ? 'bg-red-500 hover:bg-red-600'
                                : assessmentType === 'Redelijk' ? 'bg-yellow-500 hover:bg-yellow-600'
                                : 'bg-green-500 hover:bg-green-600'
                            }`}
                          >
                            {assessmentType}
                          </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center mt-4 w-full">
                    <a
                      href={generateChatGPTLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out shadow text-sm"
                    >
                      Leer meer over dit onderwerp met AI
                    </a>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Verbeterde afronding melding met statistieken */}
          {showRepeatDone && (
            <div className="text-center mb-4 p-8 bg-blue-50 rounded-lg border-2 border-blue-200 shadow-lg">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-blue-800 mb-4">
                  {isReviewing ? '🎯 Herhaling Afgerond!' : '🎉 Set Afgerond!'}
                </h3>
                <p className="text-lg text-gray-700 mb-4">
                  Je hebt alle {activeFlashcards.length} kaarten in {isReviewing ? 'deze herhaalronde' : 'deze set'} ({levelLabels[levelFilter]}) doorgenomen.
                </p>
                
                {/* Statistieken */}
                <div className="bg-white p-4 rounded-lg shadow-inner mb-6">
                  <h4 className="text-gray-700 font-semibold mb-3">Resultaten deze ronde:</h4>
                  <div className="flex justify-center gap-6">
                    <div className="text-green-600">
                      <div className="text-2xl font-bold">{activeStats.goed}</div>
                      <div className="text-sm">Goed</div>
                    </div>
                    <div className="text-yellow-600">
                      <div className="text-2xl font-bold">{activeStats.redelijk}</div>
                      <div className="text-sm">Redelijk</div>
                    </div>
                    <div className="text-red-600">
                      <div className="text-2xl font-bold">{activeStats.niet}</div>
                      <div className="text-sm">Niet</div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">
                  Wat wil je nu doen?
                </p>
              </div>
              
              <div className="flex flex-col gap-4 max-w-md mx-auto">
                {isReviewing ? (
                  <>
                    <button
                      onClick={startOriginalSet}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
                    >
                      Terug naar Leermodus
                    </button>
                    {(activeStats.niet > 0 || activeStats.redelijk > 0) && (
                      <button
                        onClick={() => {
                          setShowRepeatDone(false);
                          setCurrentCardIndex(0);
                        }}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
                      >
                        Herhaal deze kaarten nog een keer
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {/* Herhaalopties voor verschillende niveaus */}
                    {activeStats.niet > 0 && (
                      <button
                        onClick={() => startReview('Niet')}
                        className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
                      >
                        Herhaal vragen die je niet kent ({activeStats.niet})
                      </button>
                    )}
                    {activeStats.redelijk > 0 && (
                      <button
                        onClick={() => startReview('Redelijk')}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
                      >
                        Herhaal vragen die je redelijk kent ({activeStats.redelijk})
                      </button>
                    )}
                    {(activeStats.niet > 0 || activeStats.redelijk > 0) && (
                      <button
                        onClick={() => startReview('Niet_Redelijk')}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
                      >
                        Herhaal alle vragen die je nog moet oefenen ({activeStats.niet + activeStats.redelijk})
                      </button>
                    )}
                    <button
                      onClick={() => setLevelFilter('')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
                    >
                      Kies een ander niveau
                    </button>
                    <button
                      onClick={() => {
                        setShowRepeatDone(false);
                        setCurrentCardIndex(0);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
                    >
                      Nog een keer deze set
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          

        </div>
      ) : (
        <div className="text-center text-gray-500 italic mt-8">Kies eerst een niveau om te starten met de flashcards.</div>
      )}
    </div>
  );
}

export default TermenSection; 