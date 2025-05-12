import React, { useState } from 'react';

function KlinischRedenerenSection({ cases, answers, onAnswerChange, scores, onScoreChange }) {
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [isAiChecking, setIsAiChecking] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');
  const [selfAssessment, setSelfAssessment] = useState({});
  const [showIntro, setShowIntro] = useState(true);

  const currentCase = cases[currentCaseIndex];

  const goToNextCase = () => {
    if (currentCaseIndex < cases.length - 1) {
      setCurrentCaseIndex(prev => prev + 1);
      setShowModelAnswer(false);
      setAiFeedback('');
    }
  };

  const goToPreviousCase = () => {
    if (currentCaseIndex > 0) {
      setCurrentCaseIndex(prev => prev - 1);
      setShowModelAnswer(false);
      setAiFeedback('');
    }
  };

  const handleSelfAssessment = (level) => {
    const newScores = {
      ...scores,
      [currentCase.id]: level
    };
    onScoreChange(newScores);
    setSelfAssessment({
      ...selfAssessment,
      [currentCase.id]: level
    });
  };

  const checkWithAI = (casus, answer) => {
    const prompt = encodeURIComponent(
      `Als expert in fysiotherapie, beoordeel het volgende antwoord van een student op een klinische casus over bindweefselherstel.

Casus:
${casus.description}

Vraag:
${casus.question}

Beoordelingscriteria:
${casus.criteria.map(c => '- ' + c).join('\n')}

Student antwoord:
${answer}

Model antwoord ter referentie:
${casus.modelAnswer}

Geef een gestructureerde analyse met:
1. Klinisch redeneren (gebruik van kennis, logica en onderbouwing)
2. Sterke punten in de analyse
3. Verbeterpunten en aandachtspunten
4. Suggesties voor verdieping
5. Eindbeoordeling (expert/gevorderd/beginner)`
    );
    window.open(`https://chat.openai.com/?q=${prompt}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-blue-700">Klinisch Redeneren</h2>
      
      <div className="mb-4">
        <button
          className="text-blue-700 font-semibold mb-2 focus:outline-none flex items-center gap-2"
          onClick={() => setShowIntro((prev) => !prev)}
          aria-expanded={showIntro}
          aria-controls="klinischredeneren-intro"
        >
          {showIntro ? '▼' : '►'} Inleiding
        </button>
        {showIntro && (
          <div id="klinischredeneren-intro" className="bg-blue-50 p-6 rounded-lg shadow-sm">
            <p className="text-gray-700 leading-relaxed">
              Welkom bij Klinisch Redeneren, waar we de diepte ingaan! Hier leer je om je kennis toe te passen in complexe, realistische situaties. Je ontwikkelt het vermogen om klinische problemen te analyseren, verschillende opties te overwegen en weloverwogen beslissingen te nemen. Dit is waar je leert om theorie om te zetten in praktische vaardigheden.
            </p>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div className="text-gray-600">
            Casus {currentCaseIndex + 1} van {cases.length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              {currentCase.caseText}
            </h3>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Jouw analyse:
              </label>
              <textarea
                value={answers[currentCase.id] || ''}
                onChange={(e) => onAnswerChange(currentCase.id, e.target.value)}
                className="w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Beschrijf hier je klinische redenering..."
              />
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowModelAnswer(!showModelAnswer)}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200"
                >
                  {showModelAnswer ? 'Verberg modelantwoord' : 'Toon modelantwoord'}
                </button>
                <button
                  onClick={() => checkWithAI(currentCase, answers[currentCase.id] || '')}
                  disabled={!answers[currentCase.id]}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    !answers[currentCase.id]
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Controleer met AI
                </button>
              </div>

              {showModelAnswer && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Modelantwoord:</h4>
                  <p className="text-blue-900">{currentCase.modelAnswer}</p>
                  <div className="mt-4">
                    <h4 className="font-medium text-blue-800 mb-2">Beoordelingscriteria:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {currentCase.criteria.map((criterion, index) => (
                        <li key={index} className="text-blue-900">{criterion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {aiFeedback && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">AI Analyse:</h4>
                  <pre className="whitespace-pre-wrap text-green-900 font-sans">{aiFeedback}</pre>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Hoe goed denk je dat je het hebt gedaan?</h4>
                <div className="flex gap-3">
                  {['beginner', 'gevorderd', 'expert'].map((level) => (
                    <button
                      key={level}
                      onClick={() => handleSelfAssessment(level)}
                      className={`px-4 py-2 rounded-lg font-medium capitalize ${
                        selfAssessment[currentCase.id] === level
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
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={goToPreviousCase}
            disabled={currentCaseIndex === 0}
            className={`px-4 py-2 rounded-lg font-medium ${
              currentCaseIndex === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            ← Vorige
          </button>
          
          <button
            onClick={goToNextCase}
            disabled={currentCaseIndex === cases.length - 1}
            className={`px-4 py-2 rounded-lg font-medium ${
              currentCaseIndex === cases.length - 1
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Volgende →
          </button>
        </div>
      </div>
    </div>
  );
}

export default KlinischRedenerenSection; 