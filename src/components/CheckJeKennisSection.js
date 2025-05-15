import React, { useState, useEffect } from 'react';
import usePersistentToggle from './usePersistentToggle';

function CheckJeKennisSection({ questions, answers, onAnswerChange, scores, onScoreChange, resetKey, onAnswerVersionsChange, kennisBoosterTitel }) {
  const [currentQuestions, setCurrentQuestions] = useState([...questions]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [isAiChecking, setIsAiChecking] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');
  const [selfAssessment, setSelfAssessment] = useState({});
  const [isReviewing, setIsReviewing] = useState(false);
  const [showIntro, toggleIntro] = usePersistentToggle('check_je_kennis_intro', true);
  const [showTips, toggleTips] = usePersistentToggle('check_je_kennis_tips', false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [answerVersions, setAnswerVersions] = useState({});
  const [currentVersion, setCurrentVersion] = useState({});
  const [audienceFilter, setAudienceFilter] = useState('allebij'); // Default filter

  useEffect(() => {
    let filteredQuestions = [...questions];
    if (audienceFilter === 'uitleg aan patienten') {
      filteredQuestions = questions.filter(q => q.type === 'client');
    } else if (audienceFilter === 'uitleg aan collega\'s') {
      filteredQuestions = questions.filter(q => q.type === 'colleague');
    }
    // Als 'allebij' is geselecteerd, of een onbekende filter, toon alles (reeds gedaan met [...questions])

    setCurrentQuestions(filteredQuestions);
    setCurrentQuestionIndex(0);
    setShowModelAnswer(false);
    setIsAiChecking(false);
    setAiFeedback('');
    setSelfAssessment({});
    setIsReviewing(false);
    // We resetten answerVersions en currentVersion hier niet, zodat antwoorden behouden blijven bij filterwissel
    // setAnswerVersions({});
    // setCurrentVersion({});
  }, [resetKey, questions, audienceFilter]);

  useEffect(() => {
    if (typeof onAnswerVersionsChange === 'function') {
      onAnswerVersionsChange(answerVersions);
    }
  }, [answerVersions, onAnswerVersionsChange]);

  // Bepaal het huidige pogingnummer voor deze vraag
  const savedVersionCount = answerVersions[currentQuestions[currentQuestionIndex]?.id] ? answerVersions[currentQuestions[currentQuestionIndex].id].length : 0;
  const attemptNumber = selfAssessment[currentQuestions[currentQuestionIndex]?.id] ? savedVersionCount : savedVersionCount + 1;

  /*
   * Zorg dat de lokale selfAssessment state altijd in sync blijft met de
   * doorgegeven scores-prop. Dit is nodig om na een herlaad of wanneer de gebruiker
   * terugkeert naar het hoofdstuk, de juiste vergrendeling en status van de vraag
   * te tonen.
   */
  useEffect(() => {
    setSelfAssessment(scores);
  }, [scores]);

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

    // Save the current answer as a version
    const versionNumber = (answerVersions[currentQuestion.id]?.length || 0) + 1;
    const newVersion = {
      answer: answers[currentQuestion.id],
      score: level,
      timestamp: new Date().toISOString(),
      version: versionNumber
    };

    setAnswerVersions(prev => ({
      ...prev,
      [currentQuestion.id]: [...(prev[currentQuestion.id] || []), newVersion]
    }));

    // Update the current version
    setCurrentVersion(prev => ({
      ...prev,
      [currentQuestion.id]: versionNumber
    }));
  };

  const checkWithAI = (question, answer) => {
    const checklist = question.type === 'client' ? 
      `Checklist voor patiënt uitleg:
- Vermijd medische vaktaal of leg deze meteen eenvoudig uit
- Gebruik eenvoudige, begrijpelijke zinnen
- Maak gebruik van metaforen of vergelijkingen (bijv. "de zenuw is als een kabel met isolatie")
- Focus op wat relevant is voor de patiënt` :
      `Checklist voor collega uitleg:
- Gebruik vaktermen en definities correct
- Leg fysiologische/mechanische processen nauwkeurig en met voldoende diepgang uit
- Toon onderliggende verbanden of oorzaken-gevolgrelaties`;

    const prompt = encodeURIComponent(
      `Als expert in fysiotherapie, beoordeel het volgende antwoord van een student op een vraag over ${kennisBoosterTitel}.

Vraag:
${question.questionText}

${checklist}

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

  const startNewAttempt = () => {
    // Clear the current answer but keep versions
    onAnswerChange(currentQuestion.id, '');
    // Verwijder de eerdere zelfbeoordeling zodat de buttons weer actief worden
    const newScores = { ...scores };
    delete newScores[currentQuestion.id];
    onScoreChange(newScores);

    setSelfAssessment(prev => {
      const updated = { ...prev };
      delete updated[currentQuestion.id];
      return updated;
    });

    setShowModelAnswer(false);
    setAiFeedback('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-blue-700">Check je Kennis</h2>
      
      <div className="mb-4">
        <button
          className="text-blue-700 font-semibold mb-2 focus:outline-none flex items-center gap-2"
          onClick={toggleIntro}
          aria-expanded={showIntro}
          aria-controls="checkkennis-intro"
        >
          {showIntro ? '▼' : '►'} Inleiding
        </button>
        {showIntro && (
          <div id="checkkennis-intro" className="bg-blue-50 p-4 rounded-lg shadow-sm space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Check je Kennis is jouw persoonlijke voortgangscheck. Hier ontdek je welke kennisonderwerpen je al goed beheerst en waar nog winst te behalen valt. Door jouw kennis actief op te halen uit je geheugen en deze uit te leggen aan een denkbeeldige patiënt of collega, leer je diepgaander en effectiever.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Deze oefening maakt gebruik van retrieval practice: een bewezen leermethode waarbij je actief informatie uit je geheugen probeert op te roepen in plaats van deze opnieuw te bestuderen. Dat voelt soms lastig, maar juist op die momenten versterk je je begrip en vergroot je de kans dat je de kennis op lange termijn onthoudt.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Gebruik dit onderdeel als spiegel: waar voel je je zeker over, en waar merk je dat je uitleg nog scherper kan?
            </p>
          </div>
        )}
      </div>

      <div className="mb-4">
        <button
          className="text-blue-700 font-semibold mb-2 focus:outline-none flex items-center gap-2"
          onClick={toggleTips}
          aria-expanded={showTips}
          aria-controls="checkkennis-tips"
        >
          {showTips ? '▼' : '►'} Bekijk tips voor effectief oefenen
        </button>
        {showTips && (
          <div id="checkkennis-tips" className="bg-blue-50 p-4 rounded-lg shadow-sm space-y-4">
            <h3 className="font-semibold text-blue-800 mb-2">Werkwijze</h3>
            <ol className="list-decimal ml-6 space-y-2 text-gray-700">
              <li>Kies een onderwerp en stel je voor dat je het uitlegt aan een patiënt of collega.</li>
              <li>Type je uitleg in het tekstvak. Probeer helder, begrijpelijk en volledig te zijn.</li>
              <li>Vergelijk je uitleg met de antwoordsleutel en/of gebruik de functie Controleer met AI voor directe feedback.</li>
              <li>Geef jezelf een score (bijvoorbeeld van 1 tot 5): Hoe duidelijk, accuraat en compleet was jouw uitleg?</li>
              <li>Reflecteer: Wat ging goed? Wat zou je anders doen bij een volgende uitleg?</li>
            </ol>

            <h3 className="font-semibold text-blue-800 mt-4 mb-2">Tip</h3>
            <p className="text-gray-700">
              Wil je liever spreken dan typen? Gebruik dan bijvoorbeeld:
            </p>
            <ul className="list-disc ml-6 text-gray-700">
              <li>De sneltoets van Windows: Windows-logotoets + H</li>
              <li>Op een Mac is dit meestal Fn (twee keer)</li>
              <li>Of spreek je uitleg in bij ChatGPT (gebruik de microfoonfunctie en kopieer de tekst naar deze app).</li>
            </ul>
            <p className="text-gray-700 mt-2">
              Je gesproken tekst wordt automatisch omgezet naar tekst.
            </p>
          </div>
        )}
      </div>

      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Filter op Uitlegtype</h3>
        <div className="flex flex-wrap gap-2">
          {['allebij', 'uitleg aan patienten', 'uitleg aan collega\'s'].map(filterType => (
            <button
              key={filterType}
              onClick={() => setAudienceFilter(filterType)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${audienceFilter === filterType
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1).replace("collega\'s", "collega's")}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-6 flex items-center gap-4">
          <h3 className="text-2xl font-semibold text-blue-700">
            Vraag {currentQuestionIndex + 1} van {currentQuestions.length}
          </h3>
          <span className="bg-blue-600 text-white text-lg font-semibold px-4 py-1 rounded-full shadow-sm">
            Poging: {attemptNumber}
          </span>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-500">
              {currentQuestion.type === 'client' ? 'Voor Cliënt' : 'Voor Collega'}
            </span>
            <h3 className="text-lg font-medium text-gray-800 mt-1">
              {currentQuestion.questionText}
            </h3>
          </div>

          {currentQuestions.length === 0 && (
            <p className="text-center text-gray-700 mb-4">
              Geen vragen beschikbaar voor het geselecteerde filter.
            </p>
          )}

          {currentQuestion && (
            <>
              <div className="mb-4">
                <button
                  className="text-blue-700 font-semibold mb-2 focus:outline-none flex items-center gap-2"
                  onClick={() => setShowChecklist((prev) => !prev)}
                  aria-expanded={showChecklist}
                  aria-controls="explanation-checklist"
                >
                  {showChecklist ? '▼' : '►'} {currentQuestion.type === 'client' ? '👂' : '🧠'} Bekijk checklist voor {currentQuestion.type === 'client' ? 'patiënt' : 'collega'} uitleg
                </button>
                {showChecklist && (
                  <div id="explanation-checklist" className="bg-blue-50 p-4 rounded-lg shadow-sm">
                    {currentQuestion.type === 'client' ? (
                      <>
                        <h4 className="font-semibold text-blue-800 mb-2">👂 Uitleg aan een patiënt – Checklijst</h4>
                        <ul className="list-disc ml-6 space-y-2 text-gray-700">
                          <li>Vermijd medische vaktaal of leg deze meteen eenvoudig uit</li>
                          <li>Gebruik eenvoudige, begrijpelijke zinnen</li>
                          <li>Maak gebruik van metaforen of vergelijkingen (bijv. "de zenuw is als een kabel met isolatie")</li>
                          <li>Focus op wat relevant is voor de patiënt</li>
                        </ul>
                      </>
                    ) : (
                      <>
                        <h4 className="font-semibold text-blue-800 mb-2">🧠 Uitleg aan een collega – Checklijst</h4>
                        <ul className="list-disc ml-6 space-y-2 text-gray-700">
                          <li>Gebruik vaktermen en definities correct</li>
                          <li>Leg fysiologische/mechanische processen nauwkeurig en met voldoende diepgang uit</li>
                          <li>Toon onderliggende verbanden of oorzaken-gevolgrelaties</li>
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Jouw antwoord:
                </label>
                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => onAnswerChange(currentQuestion.id, e.target.value)}
                  readOnly={!!selfAssessment[currentQuestion.id]}
                  className={`w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    selfAssessment[currentQuestion.id] ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Typ hier je antwoord..."
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="relative group">
                  <button
                    onClick={() => setShowModelAnswer(!showModelAnswer)}
                    disabled={!answers[currentQuestion.id]}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      !answers[currentQuestion.id]
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {showModelAnswer ? 'Verberg antwoordsleutel' : 'Toon antwoordsleutel'}
                  </button>
                  {!answers[currentQuestion.id] && (
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
                  {!answers[currentQuestion.id] && (
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
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-3">
                    {['beginner', 'gevorderd', 'expert'].map((level) => (
                      <div key={level} className="relative group">
                        <button
                          onClick={() => handleSelfAssessment(level)}
                          disabled={!answers[currentQuestion.id] || selfAssessment[currentQuestion.id]}
                          className={`px-4 py-2 rounded-lg font-medium capitalize ${
                            !answers[currentQuestion.id] || selfAssessment[currentQuestion.id]
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          } ${
                            selfAssessment[currentQuestion.id] === level
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
                        {!answers[currentQuestion.id] && (
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
                  
                  {selfAssessment[currentQuestion.id] && (
                    <div className="flex flex-col gap-2">
                      <div className="bg-green-50 p-3 rounded-lg text-green-700">
                        <p className="font-medium">✓ Antwoord opgeslagen als {selfAssessment[currentQuestion.id]}</p>
                        {currentVersion[currentQuestion.id] > 1 && (
                          <p className="text-sm mt-1">Dit is je {currentVersion[currentQuestion.id]}e poging</p>
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
            </>
          )}
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