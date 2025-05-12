import React, { useState, useEffect } from 'react';
import { FLASHCARD_QUESTIONS } from '../constants';
import '../styles/FlashcardSection.css';

const FlashcardSection = ({ onScoreUpdate }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCards, setCompletedCards] = useState(new Set());
  const [selfScore, setSelfScore] = useState({});

  useEffect(() => {
    // Shuffle flashcards on component mount
    const shuffledCards = [...FLASHCARD_QUESTIONS].sort(() => Math.random() - 0.5);
    setFlashcards(shuffledCards);
  }, []);

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleSelfAssessment = (score) => {
    setSelfScore({ ...selfScore, [flashcards[currentIndex].id]: score });
    const newCompletedCards = new Set(completedCards);
    newCompletedCards.add(flashcards[currentIndex].id);
    setCompletedCards(newCompletedCards);
    const progress = (newCompletedCards.size / flashcards.length) * 100;
    onScoreUpdate(progress);
    // Automatically go to next card if not last
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  if (flashcards.length === 0) {
    return <div>Loading flashcards...</div>;
  }

  const currentCard = flashcards[currentIndex];
  const isCompleted = completedCards.has(currentCard.id);

  return (
    <div className="flashcard-section">
      <h2>Flashcards</h2>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${(completedCards.size / flashcards.length) * 100}%` }}
        ></div>
      </div>
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={handleCardFlip}>
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <p>{currentCard.front}</p>
          </div>
          <div className="flashcard-back">
            <p>{currentCard.back}</p>
          </div>
        </div>
      </div>
      <div className="flashcard-controls">
        <div className="self-assessment-block">
          {isFlipped && (
            <>
              <div className="self-assessment-label">Hoe goed kende je dit?</div>
              <div className="self-assessment-options">
                <button onClick={() => handleSelfAssessment('Nee')} className={`self-score-btn${selfScore[currentCard.id]==='Nee' ? ' selected' : ''}`}>Nee</button>
                <button onClick={() => handleSelfAssessment('Redelijk')} className={`self-score-btn${selfScore[currentCard.id]==='Redelijk' ? ' selected' : ''}`}>Redelijk</button>
                <button onClick={() => handleSelfAssessment('Goed')} className={`self-score-btn${selfScore[currentCard.id]==='Goed' ? ' selected' : ''}`}>Goed</button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="card-counter">
        {currentIndex + 1} / {flashcards.length}
      </div>
    </div>
  );
};

export default FlashcardSection; 