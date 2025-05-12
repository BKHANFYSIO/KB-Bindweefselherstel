import React, { useState, useEffect } from 'react';

function CheckJeKennisSection({ questions, answers, onAnswerChange, scores, onScoreChange }) {
  const [currentQuestions, setCurrentQuestions] = useState([...questions]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [isAiChecking, setIsAiChecking] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');
  const [selfAssessment, setSelfAssessment] = useState({});
  const [isReviewing, setIsReviewing] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const currentQuestion = currentQuestions[currentQuestionIndex];

  const goToNextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowModelAnswer(false);
      setAiFeedback('');
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowModelAnswer(false);
      setAiFeedback('');
    }
  };

  const handleSelfAssessment = (level) => {
    const newScores = {
      ...scores,
      [currentQuestion.id]: level
    };
    onScoreChange(newScores);
    setSelfAssessment({
      ...selfAssessment,
      [currentQuestion.id]: level
    });
  };

  const checkWithAI = (question, answer) => {
    const prompt = encodeURIComponent(
      `Als expert in fysiotherapie, beoordeel het volgende antwoord van een student op een vraag over bindweefselherstel.

Vraag:
${question.questionText}

Beoordelingscriteria:
${question.criteria.map(c => '- ' + c).join('\n')}

Student antwoord:
${answer}

Model antwoord ter referentie:
${question.modelAnswer}

Geef een gestructureerde analyse met:
1. Sterke punten
2. Verbeterpunten
3. Suggesties voor verdieping
4. Eindbeoordeling (expert/gevorderd/beginner)`
    );
    window.open(`https://chat.openai.com/?q=${prompt}`, '_blank');
  };

  const startReview = (level) => {
    let filteredQuestions = [];
    if (level === 'beginner') {
      filteredQuestions = questions.filter(q => scores[q.id] === 'beginner');
    } else if (level === 'beginner_gevorderd') {
      filteredQuestions = questions.filter(q => 
        scores[q.id] === 'beginner' || scores[q.id] === 'gevorderd'
      );
    } else {
      filteredQuestions = [...questions];
    }

    if (filteredQuestions.length > 0) {
      // Shuffle the filtered questions
      const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
      setCurrentQuestions(shuffled);
      setCurrentQuestionIndex(0);
      setShowModelAnswer(false);
      setAiFeedback('');
      setIsReviewing(true);
    } else {
      alert(`Geen vragen gevonden met niveau '${level === 'beginner' ? 'Beginner' : level === 'beginner_gevorderd' ? 'Beginner of Gevorderd' : 'Alles'}'.`);
    }
  };

  const startOriginalSet = () => {
    setCurrentQuestions([...questions]);
    setCurrentQuestionIndex(0);
    setShowModelAnswer(false);
    setAiFeedback('');
    setIsReviewing(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-blue-700">Check je Kennis</h2>
      
      <div className="mb-4">
        <button
          className="text-blue-700 font-semibold mb-2 focus:outline-none flex items-center gap-2"
          onClick={() => setShowIntro((prev) => !prev)}
          aria-expanded={showIntro}
          aria-controls="checkkennis-intro"
        >
          {showIntro ? '▼' : '►'} Inleiding
        </button>
        {showIntro && (
          <div id="checkkennis-intro" className="bg-blue-50 p-6 rounded-lg shadow-sm">
            <p className="text-gray-700 leading-relaxed">
              Check je Kennis is je persoonlijke voortgangscheck. Hier kun je zien hoe ver je bent in je leerproces en welke onderwerpen je al goed beheerst. Dit onderdeel helpt je om gericht te studeren en te focussen op de gebieden die nog extra aandacht nodig hebben. Gebruik het als een spiegel voor je eigen leerproces.
            </p>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-blue-700">
            Check je Kennis {isReviewing ? "(Herhaling)" : ""}
          </h2>
          <div className="text-gray-600">
            Vraag {currentQuestionIndex + 1} van {currentQuestions.length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-500">
              {currentQuestion.type === 'client' ? 'Voor Cliënt' : 'Voor Collega'}
            </span>
            <h3 className="text-lg font-medium text-gray-800 mt-1">
              {currentQuestion.questionText}
            </h3>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Jouw antwoord:
            </label>
            <textarea
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => onAnswerChange(currentQuestion.id, e.target.value)}
              className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Typ hier je antwoord..."
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowModelAnswer(!showModelAnswer)}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200"
            >
              {showModelAnswer ? 'Verberg antwoordsleutel' : 'Toon antwoordsleutel'}
            </button>
            <button
              onClick={() => checkWithAI(currentQuestion, answers[currentQuestion.id] || '')}
              disabled={!answers[currentQuestion.id] || isAiChecking}
              className={`px-4 py-2 rounded-lg font-medium ${
                !answers[currentQuestion.id] || isAiChecking
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isAiChecking ? 'Bezig met controleren...' : 'Controleer met AI'}
            </button>
          </div>

          {showModelAnswer && (
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Antwoordsleutel:</h4>
              <p className="text-blue-900">{currentQuestion.modelAnswer}</p>
              <div className="mt-4">
                <h4 className="font-medium text-blue-800 mb-2">Beoordelingscriteria:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {currentQuestion.criteria.map((criterion, index) => (
                    <li key={index} className="text-blue-900">{criterion}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {aiFeedback && (
            <div className="mt-6 bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">AI Feedback:</h4>
              <pre className="whitespace-pre-wrap text-green-900 font-sans">{aiFeedback}</pre>
            </div>
          )}

          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-2">Hoe goed denk je dat je het hebt gedaan?</h4>
            <div className="flex gap-3">
              {['beginner', 'gevorderd', 'expert'].map((level) => (
                <button
                  key={level}
                  onClick={() => handleSelfAssessment(level)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize ${
                    selfAssessment[currentQuestion.id] === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
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
            
            <button
              onClick={goToNextQuestion}
              disabled={currentQuestionIndex === currentQuestions.length - 1}
              className={`px-4 py-2 rounded-lg font-medium ${
                currentQuestionIndex === currentQuestions.length - 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Volgende →
            </button>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3 text-center text-blue-700">Herhaling Opties</h3>
            <p className="text-center text-gray-600 mb-4">
              Klaar met deze ronde of wil je specifieke vragen herhalen?
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => startReview('beginner')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out shadow"
              >
                Herhaal 'Beginner' ({questions.filter(q => scores[q.id] === 'beginner').length})
              </button>
              <button
                onClick={() => startReview('beginner_gevorderd')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out shadow"
              >
                Herhaal 'Beginner' & 'Gevorderd' ({questions.filter(q => scores[q.id] === 'beginner' || scores[q.id] === 'gevorderd').length})
              </button>
              <button
                onClick={() => startReview('all')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out shadow"
              >
                Herhaal Alles ({questions.length})
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
        </div>
      </div>
    </div>
  );
}

export default CheckJeKennisSection; 