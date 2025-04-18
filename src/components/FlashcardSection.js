import React, { useState, useEffect } from 'react';
import { FLASHCARD_QUESTIONS } from '../constants';
import '../styles/FlashcardSection.css';

const FlashcardSection = ({ onScoreUpdate }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCards, setCompletedCards] = useState(new Set());

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

  const handleMarkComplete = () => {
    const newCompletedCards = new Set(completedCards);
    newCompletedCards.add(flashcards[currentIndex].id);
    setCompletedCards(newCompletedCards);

    // Calculate and update progress
    const progress = (newCompletedCards.size / flashcards.length) * 100;
    onScoreUpdate(progress);
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
        <button 
          className="control-button"
          onClick={handlePrevCard}
          disabled={currentIndex === 0}
        >
          Previous
        </button>
        <button 
          className={`complete-button ${isCompleted ? 'completed' : ''}`}
          onClick={handleMarkComplete}
        >
          {isCompleted ? 'Completed' : 'Mark Complete'}
        </button>
        <button 
          className="control-button"
          onClick={handleNextCard}
          disabled={currentIndex === flashcards.length - 1}
        >
          Next
        </button>
      </div>
      <div className="card-counter">
        {currentIndex + 1} / {flashcards.length}
      </div>
    </div>
  );
};

export default FlashcardSection; 