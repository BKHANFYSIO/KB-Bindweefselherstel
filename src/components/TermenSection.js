import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Initialiseer of update repeatCounts als initialFlashcardRepeats verandert
    // en verschilt van de huidige state, om onnodige updates te voorkomen.
    if (JSON.stringify(initialFlashcardRepeats) !== JSON.stringify(repeatCounts)) {
      setRepeatCounts(initialFlashcardRepeats || {});
    }
  }, [initialFlashcardRepeats]);

  // Deze effect hook beheert de set kaarten die getoond wordt in de normale leermodus.
  useEffect(() => {
    if (!isReviewing) {
      let cardsToDisplay = [];
      const validInitialFlashcards = Array.isArray(initialFlashcards) ? initialFlashcards : [];

      switch (levelFilter) {
        case 'level1':
          cardsToDisplay = validInitialFlashcards.filter(card => card && card.level === 1);
          break;
        case 'level2':
          cardsToDisplay = validInitialFlashcards.filter(card => card && card.level === 2);
          break;
        case 'level3':
          cardsToDisplay = validInitialFlashcards.filter(card => card && card.level === 3);
          break;
        case 'level1_2':
          cardsToDisplay = validInitialFlashcards.filter(card => card && (card.level === 1 || card.level === 2));
          break;
        case 'all':
        default:
          cardsToDisplay = [...validInitialFlashcards];
          break;
      }
      setActiveFlashcards(shuffleArray(cardsToDisplay));
      setCurrentCardIndex(0);
      setShowAnswer(false);
      // Reset review-gerelateerde states als we de level filter veranderen
      setReviewedThisRound([]);
      setShowRepeatDone(false);
    }
  }, [initialFlashcards, levelFilter, isReviewing]);

  useEffect(() => {
    if (typeof onRepeatCountsChange === 'function') {
      onRepeatCountsChange(repeatCounts);
    }
  }, [repeatCounts, onRepeatCountsChange]);

  const handleAssessment = (cardId, assessmentLevel) => {
    onAssessmentsChange({ ...assessments, [cardId]: assessmentLevel });
    if (isReviewing) {
      setRepeatCounts(prev => ({ ...prev, [cardId]: (prev[cardId] || 0) + 1 }));
      setReviewedThisRound(prev => prev.includes(cardId) ? prev : [...prev, cardId]);
    }
    setTimeout(() => {
      if (isReviewing) {
        if (activeFlashcards.length > 0 && reviewedThisRound.length + (reviewedThisRound.includes(cardId) ? 0 : 1) >= activeFlashcards.length) {
          setShowRepeatDone(true);
          return;
        }
      }
      if (activeFlashcards.length > 0) {
        setShowAnswer(false);
        setCurrentCardIndex((prevIndex) => (prevIndex + 1) % activeFlashcards.length);
      }
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

    if (assessmentFilterType === 'Niet') {
      filteredForReviewSession = cardsToConsiderForReview.filter(card => card && assessments[card.id] === 'Niet');
    } else if (assessmentFilterType === 'Niet_Redelijk') {
      filteredForReviewSession = cardsToConsiderForReview.filter(card => card && (assessments[card.id] === 'Niet' || assessments[card.id] === 'Redelijk'));
    } else { // 'Alles' (alle beoordeelde kaarten binnen het huidige filter)
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

  // Tellingen voor review knoppen, gebaseerd op kaarten binnen het huidige level filter
  const cardsForCurrentFilterForCounts = getCardsForCurrentLevelFilter();
  const countNeeInFilter = cardsForCurrentFilterForCounts.filter(c => c && assessments[c.id] === 'Niet').length;
  const countNeeRedelijkInFilter = cardsForCurrentFilterForCounts.filter(c => c && (assessments[c.id] === 'Niet' || assessments[c.id] === 'Redelijk')).length;
  const countAssessedInFilter = cardsForCurrentFilterForCounts.filter(c => c && assessments[c.id]).length;

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
                De Begrippen Trainer helpt je om de belangrijkste termen en concepten rondom bindweefselherstel eigen te maken. Gebruik de filters hieronder om op niveau te oefenen.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filter UI (alleen als niet in review) */}
      {!isReviewing && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Filter op Niveau</h3>
          <div className="flex flex-wrap gap-2">
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
              {showInstructions ? '▼' : '►'} Bekijk de stappen & tips
            </button>
            {showInstructions && (
              <div id="flashcard-instructions" className="bg-blue-50 p-6 rounded-lg shadow-sm mt-2">
                <strong>Stappen & tips:</strong>
                <ol className="list-decimal ml-5 mt-2 space-y-1">
                  {!isReviewing && <li>Selecteer eerst een niveau hierboven.</li>}
                  <li>Kijk goed naar de term. Probeer zélf het antwoord te bedenken.</li>
                  <li>Klik op \'Toon Antwoord\'.</li>
                  <li>Beoordeel eerlijk hoe goed je het wist.</li>
                  {allCardsInCurrentSetAssessed && !isReviewing && <li>Alle kaarten van dit niveau beoordeeld? Kies hieronder of je specifieke kaarten wilt herhalen.</li>}
                  {isReviewing && <li>Herhaal de kaarten die je nog niet goed kent.</li>}
                </ol>
              </div>
            )}
          </div>

          {/* Flashcard zelf */}
          {currentCard && (
            <div className="border p-6 rounded-lg shadow-md bg-yellow-50 min-h-[200px] flex flex-col justify-between items-center mb-4">
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
              {isReviewing && repeatCounts[currentCard.id] > 0 && (
                <div className="mt-2 text-xs text-gray-500">Herhaald: {repeatCounts[currentCard.id]}x</div>
              )}
            </div>
          )}

          {/* Melding & Knop als herhaalronde (review) klaar is */}
          {showRepeatDone && isReviewing && (
            <div className="text-center text-green-700 font-semibold mb-4 p-4 bg-green-50 rounded-lg">
              <p>Je hebt alle kaarten in deze herhaalronde ({levelLabels[levelFilter] !== 'Alle Niveaus' ? levelLabels[levelFilter] : 'Alle Beoordeelde'}) afgerond.</p>
              <div className="mt-4">
                <button
                  onClick={startOriginalSet} // Gaat terug naar leermodus, respecteert actieve levelFilter
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
                >
                  Terug naar Leermodus
                </button>
              </div>
            </div>
          )}
          
          {/* Herhaal-knoppen (alleen tonen als alle kaarten in huidige leerset beoordeeld zijn en niet in review-mode) */}
          {allCardsInCurrentSetAssessed && !isReviewing && cardsInCurrentLearningSet.length > 0 && (
            <div className="mt-8 text-center p-6 bg-blue-50 rounded-lg">
              <p className="text-xl font-medium text-gray-800 mb-2">
                Alle ({cardsInCurrentLearningSet.length}) kaarten van {levelLabels[levelFilter]} beoordeeld!
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Herhaal specifieke groepen binnen {levelLabels[levelFilter]}.
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  onClick={() => startReview('Niet')}
                  disabled={countNeeInFilter === 0}
                  className={`px-4 py-2 rounded-lg font-medium text-white transition-colors shadow-md text-sm ${countNeeInFilter > 0 ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                  Herhaal 'Niet' ({countNeeInFilter})
                </button>
                <button
                  onClick={() => startReview('Niet_Redelijk')}
                  disabled={countNeeRedelijkInFilter === 0}
                  className={`px-4 py-2 rounded-lg font-medium text-white transition-colors shadow-md text-sm ${countNeeRedelijkInFilter > 0 ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                  Herhaal 'Niet & Redelijk' ({countNeeRedelijkInFilter})
                </button>
                <button
                  onClick={() => startReview('Alles')}
                  disabled={countAssessedInFilter === 0}
                  className={`px-4 py-2 rounded-lg font-medium text-white transition-colors shadow-md text-sm ${countAssessedInFilter > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                  Herhaal Alle Beoordeelde ({countAssessedInFilter})
                </button>
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