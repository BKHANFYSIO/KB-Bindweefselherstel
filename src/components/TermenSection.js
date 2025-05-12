import React, { useState, useEffect } from 'react';
import { shuffleArray } from '../utils';

function TermenSection({ initialFlashcards, assessments, onAssessmentsChange }) {
  const [currentFlashcards, setCurrentFlashcards] = useState([...initialFlashcards]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [repeatCounts, setRepeatCounts] = useState({});
  const [showRepeatDone, setShowRepeatDone] = useState(false);
  const [reviewedThisRound, setReviewedThisRound] = useState([]);

  useEffect(() => {
    // Shuffle cards on component mount
    setCurrentFlashcards(shuffleArray([...initialFlashcards]));
  }, [initialFlashcards]);

  const handleAssessment = (cardId, assessmentLevel) => {
    onAssessmentsChange({ ...assessments, [cardId]: assessmentLevel });
    if (isReviewing) {
      setRepeatCounts(prev => ({ ...prev, [cardId]: (prev[cardId] || 0) + 1 }));
      setReviewedThisRound(prev => prev.includes(cardId) ? prev : [...prev, cardId]);
    }
    setTimeout(() => {
      if (isReviewing) {
        if (reviewedThisRound.length + (reviewedThisRound.includes(cardId) ? 0 : 1) === currentFlashcards.length) {
          setShowRepeatDone(true);
          return;
        }
      }
      setShowAnswer(false);
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % currentFlashcards.length);
    }, 200);
  };

  const goToNextCard = () => {
    setShowAnswer(false);
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % currentFlashcards.length);
  };

  const goToPreviousCard = () => {
    setShowAnswer(false);
    setCurrentCardIndex((prevIndex) => (prevIndex - 1 + currentFlashcards.length) % currentFlashcards.length);
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const generateChatGPTLink = () => {
    const prompt = `Leg mij meer uit over de term '${currentCard.term}' in de context van bindweefselherstel bij fysiotherapie.`;
    return `https://chat.openai.com/?q=${encodeURIComponent(prompt)}`;
  };

  const startReview = (filterType) => {
    let filteredCards = [];
    if (filterType === 'Niet') {
      filteredCards = initialFlashcards.filter(card => assessments[card.id] === 'Niet');
    } else if (filterType === 'Niet_Redelijk') {
      filteredCards = initialFlashcards.filter(card => assessments[card.id] === 'Niet' || assessments[card.id] === 'Redelijk');
    } else {
      filteredCards = [...initialFlashcards];
    }
    if (filteredCards.length > 0) {
      setCurrentFlashcards(shuffleArray(filteredCards));
      setCurrentCardIndex(0);
      setShowAnswer(false);
      setIsReviewing(true);
      setReviewedThisRound([]);
      setShowRepeatDone(false);
    } else {
      alert(`Geen kaarten gevonden met beoordeling '${filterType === 'Niet' ? 'Niet' : filterType === 'Niet_Redelijk' ? 'Niet of Redelijk' : 'Alles'}'.`);
    }
  };

  const startOriginalSet = () => {
    setCurrentFlashcards(shuffleArray([...initialFlashcards]));
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setIsReviewing(false);
    setReviewedThisRound([]);
    setShowRepeatDone(false);
  };

  // Helper: zijn alle kaarten beoordeeld?
  const allAssessed = currentFlashcards.every(card => assessments[card.id]);
  const countNee = initialFlashcards.filter(c => assessments[c.id] === 'Niet').length;
  const countNeeRedelijk = initialFlashcards.filter(c => assessments[c.id] === 'Niet' || assessments[c.id] === 'Redelijk').length;
  const countAll = initialFlashcards.length;

  if (!currentFlashcards || currentFlashcards.length === 0) {
    if (isReviewing) {
      return (
        <div>
          <p className="text-center text-gray-700 mb-4">Geen kaarten gevonden voor deze herhaling.</p>
          <button
            onClick={startOriginalSet}
            className="block mx-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out shadow"
          >
            Terug naar Oorspronkelijke Set
          </button>
        </div>
      );
    }
    return <div>Geen flashcards beschikbaar.</div>;
  }

  const currentCard = currentFlashcards[currentCardIndex];
  if (!currentCard) {
    if (currentFlashcards.length > 0) {
      setCurrentCardIndex(0);
      setShowAnswer(false);
    }
    return <div>Fout: Kan huidige kaart niet laden. Index wordt gereset.</div>;
  }

  const hasAssessments = Object.keys(assessments).length > 0;

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-blue-700 mb-2">Begrippen Trainer</h2>
        <div className="mb-4">
          <button
            className="text-blue-700 font-semibold mb-2 focus:outline-none flex items-center gap-2"
            onClick={() => setShowIntro((prev) => !prev)}
            aria-expanded={showIntro}
            aria-controls="begrippen-intro"
          >
            {showIntro ? '▼' : '►'} Inleiding
          </button>
          {showIntro && (
            <div id="begrippen-intro" className="bg-blue-50 p-6 rounded-lg shadow-sm">
              <p className="text-gray-700 leading-relaxed">
                De Begrippen Trainer helpt je om de belangrijkste termen en concepten rondom bindweefselherstel eigen te maken. Door actief met deze begrippen te oefenen, bouw je een stevige woordenschat op die essentieel is voor het begrijpen van de stof. Dit onderdeel is speciaal ontworpen om je te helpen de juiste terminologie te leren gebruiken, wat cruciaal is voor zowel je studie als je toekomstige praktijk.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Deze trainer is vooral een mooi startpunt voor studenten voor wie de stof nieuw of redelijk nieuw is. Maar ook als je al gevorderd bent, is dit een goede plek om je begrippenkennis te testen en te herhalen.
              </p>
            </div>
          )}
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-2 text-blue-700">
          Begrippen Trainer {isReviewing ? <span className="font-bold text-red-600 ml-2">(Herhaling)</span> : ""} ({currentCardIndex + 1}/{currentFlashcards.length})
        </h2>
        <p className="mb-2 text-gray-600">
          Test en verbeter je kennis van belangrijke termen met deze interactieve flashcards.
        </p>
        <div className="mb-4">
          <button
            className="text-blue-700 font-semibold mb-2 focus:outline-none"
            onClick={() => setShowInstructions((prev) => !prev)}
          >
            {showInstructions ? '▼' : '►'} Bekijk de stappen & tips
          </button>
          {showInstructions && (
            <div className="bg-blue-50 p-6 rounded-lg shadow-sm mt-2">
              <strong>Stappen & tips:</strong>
              <ol className="list-decimal ml-5 mt-2 space-y-1">
                <li>Kijk goed naar de term hieronder.</li>
                <li>Probeer eerst zélf het antwoord te bedenken, zonder direct te klikken.</li>
                <li>Klik daarna op 'Toon Antwoord' om het juiste antwoord te zien.</li>
                <li>Beoordeel eerlijk hoe goed je het antwoord wist met de knoppen 'Niet', 'Redelijk' of 'Goed'.</li>
                <li>Herhaal de kaarten die je nog niet goed kent.</li>
              </ol>
              <p className="mt-2 text-xs text-gray-500">Tip: Door eerst actief na te denken, leer je effectiever!</p>
            </div>
          )}
        </div>
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
                  <button
                    onClick={() => handleAssessment(currentCard.id, 'Niet')}
                    className={`text-white text-sm font-medium py-1 px-3 rounded-md transition duration-150 ease-in-out shadow mb-2 sm:mb-0 ${
                      assessments[currentCard.id] === 'Niet'
                        ? 'bg-red-700 ring-2 ring-offset-1 ring-red-700'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    Niet
                  </button>
                  <button
                    onClick={() => handleAssessment(currentCard.id, 'Redelijk')}
                    className={`text-white text-sm font-medium py-1 px-3 rounded-md transition duration-150 ease-in-out shadow mb-2 sm:mb-0 ${
                      assessments[currentCard.id] === 'Redelijk'
                        ? 'bg-yellow-700 ring-2 ring-offset-1 ring-yellow-700'
                        : 'bg-yellow-500 hover:bg-yellow-600'
                    }`}
                  >
                    Redelijk
                  </button>
                  <button
                    onClick={() => handleAssessment(currentCard.id, 'Goed')}
                    className={`text-white text-sm font-medium py-1 px-3 rounded-md transition duration-150 ease-in-out shadow mb-2 sm:mb-0 ${
                      assessments[currentCard.id] === 'Goed'
                        ? 'bg-green-700 ring-2 ring-offset-1 ring-green-700'
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    Goed
                  </button>
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
          {/* Herhaalteller tonen indien van toepassing */}
          {repeatCounts[currentCard.id] > 0 && (
            <div className="mt-2 text-xs text-gray-500">Deze kaart heb je {repeatCounts[currentCard.id]} keer herhaald.</div>
          )}
        </div>
        {/* Melding als herhaalronde klaar is */}
        {showRepeatDone && isReviewing && (
          <div className="text-center text-green-700 font-semibold mb-4">
            Je hebt alle kaarten in deze herhaalronde afgerond.<br />
            Keer terug naar de oorspronkelijke set om eventueel meer te herhalen.
            <div className="mt-4">
              <button
                onClick={startOriginalSet}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-md"
              >
                Terug naar Oorspronkelijke Set
              </button>
            </div>
          </div>
        )}
        {/* Herhaal-knoppen alleen tonen als alles beoordeeld is en niet in review-mode */}
        {allAssessed && !isReviewing && (
          <div className="mt-8 text-center p-6 bg-blue-50 rounded-lg">
            <p className="text-xl font-medium text-gray-800 mb-4">
              Je hebt alle kaarten beoordeeld.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <button
                onClick={() => startReview('Niet')}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors shadow-md"
              >
                Herhaal 'Niet' ({initialFlashcards.filter(c => assessments[c.id] === 'Niet').length})
              </button>
              <button
                onClick={() => startReview('Niet_Redelijk')}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-md"
              >
                Herhaal 'Niet & Redelijk' ({initialFlashcards.filter(c => assessments[c.id] === 'Niet' || assessments[c.id] === 'Redelijk').length})
              </button>
              <button
                onClick={() => startReview('Alles')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
              >
                Herhaal Alles ({countAll})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TermenSection; 