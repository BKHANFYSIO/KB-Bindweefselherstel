import React, { useState, useEffect } from 'react';
import usePersistentToggle from './usePersistentToggle';

function KlinischRedenerenSection({ cases, answers, onAnswerChange, scores, onScoreChange, resetKey, onAnswerVersionsChange, kennisBoosterTitel }) {
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [isAiChecking, setIsAiChecking] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');
  const [selfAssessment, setSelfAssessment] = useState({});
  const [showIntro, toggleIntro] = usePersistentToggle('klinisch_redeneren_intro', true);
  const [answerVersions, setAnswerVersions] = useState({});
  const [currentVersion, setCurrentVersion] = useState({});

  useEffect(() => {
    setCurrentCaseIndex(0);
    setShowModelAnswer(false);
    setIsAiChecking(false);
    setAiFeedback('');
    setSelfAssessment({});
    setAnswerVersions({});
    setCurrentVersion({});
  }, [resetKey, cases]);

  // Bepaal huidige pogingnummer
  const savedVersionCount = answerVersions[cases[currentCaseIndex]?.id] ? (answerVersions[cases[currentCaseIndex].id] || []).length : 0;
  const attemptNumber = selfAssessment[cases[currentCaseIndex]?.id] ? savedVersionCount : savedVersionCount + 1;

  // Synchroniseer lokale selfAssessment met de doorgegeven scores zodat na herladen
  // de vergrendeling correct is.
  useEffect(() => {
    setSelfAssessment(scores);
  }, [scores]);

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

    // Save the current answer as a version
    const versionNumber = (answerVersions[currentCase.id]?.length || 0) + 1;
    const newVersion = {
      answer: answers[currentCase.id],
      score: level,
      timestamp: new Date().toISOString(),
      version: versionNumber
    };

    setAnswerVersions(prev => ({
      ...prev,
      [currentCase.id]: [...(prev[currentCase.id] || []), newVersion]
    }));

    // Update the current version
    setCurrentVersion(prev => ({
      ...prev,
      [currentCase.id]: versionNumber
    }));
  };

  const startNewAttempt = () => {
    // Clear the current answer but keep versions
    onAnswerChange(currentCase.id, '');

    // Verwijder de eerdere zelfbeoordeling zodat de buttons weer actief worden
    const newScores = { ...scores };
    delete newScores[currentCase.id];
    onScoreChange(newScores);

    setSelfAssessment(prev => {
      const updated = { ...prev };
      delete updated[currentCase.id];
      return updated;
    });

    setShowModelAnswer(false);
    setAiFeedback('');
  };

  const checkWithAI = (caseItem, answer) => {
    const prompt = encodeURIComponent(
      `Als expert in fysiotherapie, beoordeel het volgende antwoord van een student op een klinisch redeneer casus over ${kennisBoosterTitel}.

Casus:
${caseItem.caseText}

Beoordelingscriteria:
${caseItem.criteria.map(c => '- ' + c).join('\n')}

Student antwoord:
${answer}

Model antwoord ter referentie:
${caseItem.modelAnswer}

Geef een gestructureerde analyse met:
1. Klinisch redeneren (gebruik van kennis, logica en onderbouwing)
2. Sterke punten in de analyse
3. Verbeterpunten en aandachtspunten
4. Suggesties voor verdieping
5. Eindbeoordeling (expert/gevorderd/beginner)`
    );
    window.open(`https://chat.openai.com/?q=${prompt}`, '_blank');
  };

  useEffect(() => {
    if (typeof onAnswerVersionsChange === 'function') {
      onAnswerVersionsChange(answerVersions);
    }
  }, [answerVersions, onAnswerVersionsChange]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-blue-700">Klinisch Redeneren</h2>
      
      <div className="mb-4">
        <button
          className="text-blue-700 font-semibold mb-2 focus:outline-none flex items-center gap-2"
          onClick={toggleIntro}
          aria-expanded={showIntro}
          aria-controls="klinischredeneren-intro"
        >
          {showIntro ? '▼' : '►'} Inleiding
        </button>
        {showIntro && (
          <div id="klinischredeneren-intro" className="bg-blue-50 p-4 rounded-lg shadow-sm">
            <p className="text-gray-700 leading-relaxed">
              Welkom bij Klinisch Redeneren, waar we de diepte ingaan! Hier leer je om je kennis toe te passen in complexe, realistische situaties. Je ontwikkelt het vermogen om klinische problemen te analyseren, verschillende opties te overwegen en weloverwogen beslissingen te nemen. Dit is waar je leert om theorie om te zetten in praktische vaardigheden.
            </p>
          </div>
        )}
      </div>

      <div>
        <div className="mb-6 flex items-center gap-4">
          <h3 className="text-2xl font-semibold text-blue-700">
            Casus {currentCaseIndex + 1} van {cases.length}
          </h3>
          <span className="bg-blue-600 text-white text-lg font-semibold px-4 py-1 rounded-full shadow-sm">
            Poging: {attemptNumber}
          </span>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
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
                readOnly={!!selfAssessment[currentCase.id]}
                className={`w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  selfAssessment[currentCase.id] ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Beschrijf hier je klinische redenering..."
              />
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative group">
                  <button
                    onClick={() => setShowModelAnswer(!showModelAnswer)}
                    disabled={!answers[currentCase.id]}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      !answers[currentCase.id]
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {showModelAnswer ? 'Verberg modelantwoord' : 'Toon modelantwoord'}
                  </button>
                  {!answers[currentCase.id] && (
                    <div className="hidden absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg group-hover:block whitespace-nowrap z-10">
                      Vul eerst je antwoord in om feedback te krijgen
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-8 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative group">
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
                  {!answers[currentCase.id] && (
                    <div className="hidden absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg group-hover:block whitespace-nowrap z-10">
                      Vul eerst je antwoord in om feedback te krijgen
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-8 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  )}
                </div>
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
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-3">
                    {['beginner', 'gevorderd', 'expert'].map((level) => (
                      <div key={level} className="relative group">
                        <button
                          onClick={() => handleSelfAssessment(level)}
                          disabled={!answers[currentCase.id] || selfAssessment[currentCase.id]}
                          className={`px-4 py-2 rounded-lg font-medium capitalize ${
                            !answers[currentCase.id] || selfAssessment[currentCase.id]
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          } ${
                            selfAssessment[currentCase.id] === level
                              ? level === 'beginner' 
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : level === 'gevorderd'
                                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                              : level === 'beginner'
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : level === 'gevorderd'
                              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {level}
                        </button>
                        {!answers[currentCase.id] && (
                          <div className="hidden absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg group-hover:block whitespace-nowrap z-10">
                            Vul eerst je antwoord in om feedback te krijgen
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                              <div className="border-8 border-transparent border-t-gray-800"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {selfAssessment[currentCase.id] && (
                    <div className="flex flex-col gap-2">
                      <div className="bg-green-50 p-3 rounded-lg text-green-700">
                        <p className="font-medium">✓ Antwoord opgeslagen als {selfAssessment[currentCase.id]}</p>
                        {currentVersion[currentCase.id] > 1 && (
                          <p className="text-sm mt-1">Dit is je {currentVersion[currentCase.id]}e poging</p>
                        )}
                      </div>
                      <button
                        onClick={startNewAttempt}
                        className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200"
                      >
                        Opnieuw proberen
                      </button>
                    </div>
                  )}
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