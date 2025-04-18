import React, { useState, useEffect } from 'react';
import { shuffleArray } from '../utils';

function TermenSection({ initialFlashcards, assessments, onAssessmentsChange }) {
  const [currentFlashcards, setCurrentFlashcards] = useState([...initialFlashcards]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    // Shuffle cards on component mount
    setCurrentFlashcards(shuffleArray([...initialFlashcards]));
  }, [initialFlashcards]);

  const handleAssessment = (cardId, assessmentLevel) => {
    onAssessmentsChange({ ...assessments, [cardId]: assessmentLevel });
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
    if (filterType === 'Nee') {
      filteredCards = initialFlashcards.filter(card => assessments[card.id] === 'Nee');
    } else if (filterType === 'Nee_Redelijk') {
      filteredCards = initialFlashcards.filter(card => assessments[card.id] === 'Nee' || assessments[card.id] === 'Redelijk');
    } else {
      filteredCards = [...initialFlashcards];
    }
    if (filteredCards.length > 0) {
      setCurrentFlashcards(shuffleArray(filteredCards));
      setCurrentCardIndex(0);
      setShowAnswer(false);
      setIsReviewing(true);
    } else {
      alert(`Geen kaarten gevonden met beoordeling '${filterType === 'Nee' ? 'Nee' : filterType === 'Nee_Redelijk' ? 'Nee of Redelijk' : 'Alles'}'.`);
    }
  };

  const startOriginalSet = () => {
    setCurrentFlashcards(shuffleArray([...initialFlashcards]));
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setIsReviewing(false);
  };

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
    <div>
      <h2 className="text-xl font-semibold mb-2 text-blue-700">
        Begrippen Trainer {isReviewing ? "(Herhaling)" : ""} ({currentCardIndex + 1}/{currentFlashcards.length})
      </h2>
      <p className="mb-4 text-gray-600">
        Test en verbeter je kennis van belangrijke termen met deze interactieve flashcards. Volg de stappen hieronder.
      </p>
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
          <div className="mt-4 flex flex-wrap justify-center items-center space-x-3">
            <p className="text-sm text-gray-600 self-center mr-2 mb-2 sm:mb-0">Hoe goed kende je dit?</p>
            <button
              onClick={() => handleAssessment(currentCard.id, 'Nee')}
              className={`text-white text-sm font-medium py-1 px-3 rounded-md transition duration-150 ease-in-out shadow mb-2 sm:mb-0 ${
                assessments[currentCard.id] === 'Nee'
                  ? 'bg-red-700 ring-2 ring-offset-1 ring-red-700'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              Nee
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
        )}
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
        <button
          onClick={goToPreviousCard}
          className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md sm:rounded-l-md sm:rounded-r-none transition duration-150 ease-in-out"
        >
          &larr; Vorige
        </button>
        <a
          href={generateChatGPTLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto text-center bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out shadow text-sm"
        >
          Leer meer met ChatGPT
        </a>
        <button
          onClick={goToNextCard}
          className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md sm:rounded-r-md sm:rounded-l-none transition duration-150 ease-in-out"
        >
          Volgende &rarr;
        </button>
      </div>
      <p className="text-sm text-gray-600 text-center mt-4">
        <strong>Werkwijze:</strong> 1. Bekijk de term. 2. Klik 'Toon Antwoord'. 3. Beoordeel jezelf. 4. Gebruik 'Vorige'/'Volgende' of 'Leer meer'.
      </p>
      {hasAssessments && (
        <div className="mt-8 pt-6 border-t border-gray-300">
          <h3 className="text-lg font-semibold mb-3 text-center text-blue-700">Herhaling Opties</h3>
          <p className="text-center text-gray-600 mb-4">Klaar met deze ronde of wil je specifieke kaarten herhalen?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => startReview('Nee')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out shadow"
            >
              Herhaal 'Nee' ({initialFlashcards.filter(c => assessments[c.id] === 'Nee').length})
            </button>
            <button
              onClick={() => startReview('Nee_Redelijk')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out shadow"
            >
              Herhaal 'Nee' & 'Redelijk' ({initialFlashcards.filter(c => assessments[c.id] === 'Nee' || assessments[c.id] === 'Redelijk').length})
            </button>
            <button
              onClick={() => startReview('Alles')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out shadow"
            >
              Herhaal Alles ({initialFlashcards.length})
            </button>
            {isReviewing && (
              <button
                onClick={startOriginalSet}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out shadow"
              >
                Terug naar Oorspronkelijke Set
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TermenSection; 