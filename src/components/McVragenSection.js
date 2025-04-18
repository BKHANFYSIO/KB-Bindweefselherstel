import React, { useState } from 'react';

function McVragenSection({ questions, scores, onScoreChange }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewMode, setReviewMode] = useState('all'); // 'all' or 'incorrect'

  const handleAnswerSelect = (questionId, optionIndex) => {
    if (!selectedAnswers[questionId]) {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: optionIndex
      }));
      
      // Automatically submit answer for immediate feedback
      const newScores = {
        ...scores,
        [questionId]: optionIndex === questions[currentQuestionIndex].correctOptionIndex ? 'correct' : 'incorrect'
      };
      onScoreChange(newScores);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (!showReview) {
      setIsSubmitted(true);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const startReview = (mode) => {
    setReviewMode(mode);
    setShowReview(true);
    setCurrentQuestionIndex(0);
  };

  const restartQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setShowReview(false);
    setCurrentQuestionIndex(0);
    onScoreChange({});
  };

  const filteredQuestions = showReview && reviewMode === 'incorrect' 
    ? questions.filter((q) => scores[q.id] === 'incorrect')
    : questions;

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const hasAnswered = currentQuestion && selectedAnswers[currentQuestion.id] !== undefined;
  const totalCorrect = Object.values(scores).filter(score => score === 'correct').length;

  if (!currentQuestion) {
    return (
      <div className="text-center p-6">
        <p className="text-xl font-medium text-gray-800 mb-4">
          Geen vragen beschikbaar voor review.
        </p>
        <button
          onClick={restartQuiz}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
        >
          Terug naar begin
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-blue-700">Multiple Choice Vragen</h2>
        <div className="text-gray-600">
          Vraag {currentQuestionIndex + 1} van {filteredQuestions.length}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-lg font-medium text-gray-800 mb-4">
          {currentQuestion.questionText}
        </p>
        <div className="space-y-3">
          {currentQuestion.options.map((option, optionIndex) => (
            <label
              key={optionIndex}
              className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                hasAnswered
                  ? optionIndex === currentQuestion.correctOptionIndex
                    ? 'border-green-500 bg-green-50'
                    : selectedAnswers[currentQuestion.id] === optionIndex
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200'
                  : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={optionIndex}
                checked={selectedAnswers[currentQuestion.id] === optionIndex}
                onChange={() => handleAnswerSelect(currentQuestion.id, optionIndex)}
                disabled={hasAnswered}
                className="mr-3"
              />
              <span className={`${
                hasAnswered && optionIndex === currentQuestion.correctOptionIndex
                  ? 'text-green-700 font-medium'
                  : hasAnswered && selectedAnswers[currentQuestion.id] === optionIndex
                  ? 'text-red-700'
                  : 'text-gray-700'
              }`}>
                {option}
              </span>
            </label>
          ))}
        </div>
        {hasAnswered && (
          <div className={`mt-4 p-4 rounded-lg ${
            selectedAnswers[currentQuestion.id] === currentQuestion.correctOptionIndex
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            <p className="font-medium mb-2">
              {selectedAnswers[currentQuestion.id] === currentQuestion.correctOptionIndex
                ? '✓ Correct!'
                : '✗ Incorrect'}
            </p>
            <p className="text-sm">{currentQuestion.feedback}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className={`px-4 py-2 rounded-lg font-medium ${
            currentQuestionIndex === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          ← Vorige
        </button>
        
        {currentQuestionIndex === filteredQuestions.length - 1 ? (
          isSubmitted ? (
            <div className="flex gap-4">
              <button
                onClick={() => startReview('all')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                Bekijk alle vragen
              </button>
              <button
                onClick={() => startReview('incorrect')}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700"
              >
                Oefen foute vragen
              </button>
              <button
                onClick={restartQuiz}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
              >
                Start opnieuw
              </button>
            </div>
          ) : (
            <button
              onClick={goToNextQuestion}
              disabled={!hasAnswered}
              className={`px-4 py-2 rounded-lg font-medium ${
                !hasAnswered
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Afronden
            </button>
          )
        ) : (
          <button
            onClick={goToNextQuestion}
            disabled={!hasAnswered}
            className={`px-4 py-2 rounded-lg font-medium ${
              !hasAnswered
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Volgende →
          </button>
        )}
      </div>

      {isSubmitted && !showReview && (
        <div className="mt-8 text-center p-6 bg-blue-50 rounded-lg">
          <p className="text-xl font-medium text-gray-800 mb-4">
            Je hebt {totalCorrect} van de {questions.length} vragen correct beantwoord.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => startReview('all')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              Bekijk alle vragen
            </button>
            <button
              onClick={() => startReview('incorrect')}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700"
            >
              Oefen foute vragen
            </button>
            <button
              onClick={restartQuiz}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
            >
              Start opnieuw
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default McVragenSection; 