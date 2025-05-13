import React, { useState, useEffect } from 'react';
import usePersistentToggle from './usePersistentToggle';

function McVragenSection({ questions, scores, onScoreChange }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewMode, setReviewMode] = useState('all'); // 'all' or 'incorrect'
  const [showIntro, toggleIntro] = usePersistentToggle('mc_vragen_intro', true);
  const [showTips, toggleTips] = usePersistentToggle('mc_vragen_tips', false);
  const [showOptions, setShowOptions] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [shuffledOptions, setShuffledOptions] = useState({});

  // Shuffle questions and options on component mount
  useEffect(() => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
    
    // Create shuffled options for each question
    const shuffledOpts = {};
    shuffled.forEach(q => {
      const options = [...q.options];
      const correctIndex = q.correctOptionIndex;
      const shuffledIndices = options.map((_, i) => i).sort(() => Math.random() - 0.5);
      shuffledOpts[q.id] = {
        options: shuffledIndices.map(i => options[i]),
        correctIndex: shuffledIndices.indexOf(correctIndex)
      };
    });
    setShuffledOptions(shuffledOpts);
  }, [questions]);

  const handleAnswerSelect = (questionId, optionIndex) => {
    if (!selectedAnswers[questionId]) {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: optionIndex
      }));
      
      // Automatically submit answer for immediate feedback
      const newScores = {
        ...scores,
        [questionId]: optionIndex === shuffledOptions[questionId].correctIndex ? 'correct' : 'incorrect'
      };
      onScoreChange(newScores);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowOptions(false);
    } else if (!showReview) {
      setIsSubmitted(true);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowOptions(false);
    }
  };

  const startReview = (mode) => {
    setReviewMode(mode);
    setShowReview(true);
    setCurrentQuestionIndex(0);
    setShowOptions(false);
  };

  const restartQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setShowReview(false);
    setCurrentQuestionIndex(0);
    setShowOptions(false);
    onScoreChange({});
  };

  const filteredQuestions = showReview && reviewMode === 'incorrect' 
    ? shuffledQuestions.filter((q) => scores[q.id] === 'incorrect')
    : shuffledQuestions;

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const hasAnswered = currentQuestion && selectedAnswers[currentQuestion.id] !== undefined;
  const totalCorrect = Object.values(scores).filter(score => score === 'correct').length;
  const percentage = Math.round((totalCorrect / questions.length) * 100);

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
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-blue-700">MC Vragen</h2>
      
      <div className="mb-4">
        <button
          className="text-blue-700 font-semibold mb-2 focus:outline-none flex items-center gap-2"
          onClick={toggleIntro}
          aria-expanded={showIntro}
          aria-controls="mcvragen-intro"
        >
          {showIntro ? '▼' : '►'} Inleiding
        </button>
        {showIntro && (
          <div id="mcvragen-intro" className="bg-blue-50 p-6 rounded-lg shadow-sm">
            <p className="text-gray-700 leading-relaxed">
              Test je kennis met deze meerkeuzevragen! Dit onderdeel helpt je om te controleren of je de stof goed begrijpt en waar je nog extra aandacht aan moet besteden. De vragen variëren in moeilijkheidsgraad en dekken alle belangrijke aspecten van bindweefselherstel. Gebruik dit onderdeel regelmatig om je voortgang te meten en je kennis te verstevigen.
            </p>
          </div>
        )}
      </div>

      <div className="mb-4">
        <button
          className="text-blue-700 font-semibold mb-2 focus:outline-none flex items-center gap-2"
          onClick={toggleTips}
          aria-expanded={showTips}
          aria-controls="mcvragen-tips"
        >
          {showTips ? '▼' : '►'} Bekijk tips voor effectief oefenen
        </button>
        {showTips && (
          <div id="mcvragen-tips" className="bg-blue-50 p-6 rounded-lg shadow-sm mt-2">
            <strong>Tips voor effectief oefenen:</strong>
            <ul className="list-disc ml-5 mt-2 space-y-1 text-gray-700">
              <li>Het uit je hoofd ophalen van het goede antwoord heeft een veel sterker leereffect dan het herkennen van antwoordopties.</li>
              <li>Neem even de tijd om goed na te denken over het antwoord voordat je de opties bekijkt.</li>
              <li>Dit voelt moeilijker, maar het is bewezen veel effectiever voor je lange termijn geheugen.</li>
            </ul>
          </div>
        )}
      </div>

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

        {((showOptions && !showReview) || showReview) && (
          <div className="space-y-3">
            {shuffledOptions[currentQuestion.id]?.options.map((option, optionIndex) => (
              <label
                key={optionIndex}
                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  hasAnswered
                    ? optionIndex === shuffledOptions[currentQuestion.id].correctIndex
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
                  disabled={hasAnswered || showReview}
                  className="mr-3"
                />
                <span className={`${
                  hasAnswered && optionIndex === shuffledOptions[currentQuestion.id].correctIndex
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
        )}

        {!showOptions && !hasAnswered && !showReview && (
          <div className="bg-blue-50 p-6 rounded-lg mb-4">
            <button
              onClick={() => setShowOptions(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Laat antwoord opties zien
            </button>
          </div>
        )}

        {(hasAnswered || showReview) && (
          <div className={`mt-4 p-4 rounded-lg ${
            selectedAnswers[currentQuestion.id] === shuffledOptions[currentQuestion.id].correctIndex
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            <p className="font-medium mb-2">
              {selectedAnswers[currentQuestion.id] === shuffledOptions[currentQuestion.id].correctIndex
                ? '✓ Correct!'
                : '✗ Incorrect'}
            </p>
            <p className="text-sm">{currentQuestion.feedback}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        {showReview && (
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
        )}
        <div className="flex-1 flex justify-end">
          {currentQuestionIndex === filteredQuestions.length - 1 ? (
            isSubmitted ? null : (
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
      </div>

      {(isSubmitted || showReview) && (
        <div className="mt-8 text-center p-6 bg-blue-50 rounded-lg">
          {isSubmitted && (
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-4xl font-bold text-blue-700">{percentage}%</div>
              <p className="text-xl font-medium text-gray-800">
                Je hebt {totalCorrect} van de {questions.length} vragen correct beantwoord.
              </p>
            </div>
          )}
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
              Bekijk foutief beantwoorde vragen
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