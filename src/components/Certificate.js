function Certificate({ 
  name, 
  date, 
  scores, 
  questions, 
  cases, 
  answers, 
  answerVersions,
  onClose 
}) {
  const renderAppendix = () => {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Bijlage: Antwoorden en Beoordelingen</h2>
        
        {/* Check Je Kennis antwoorden */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3">Check Je Kennis</h3>
          {questions.map((question, index) => {
            const questionVersions = answerVersions[question.id] || [];
            return (
              <div key={question.id} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Vraag {index + 1}</h4>
                <p className="mb-3">{question.question}</p>
                
                {questionVersions.map((version, vIndex) => (
                  <div key={vIndex} className="mb-4 p-3 bg-white rounded border">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">Poging {version.version}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(version.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="font-medium">Antwoord:</span>
                      <p className="mt-1">{version.answer}</p>
                    </div>
                    <div>
                      <span className="font-medium">Zelfbeoordeling:</span>
                      <span className="ml-2 capitalize">{version.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Klinisch Redeneren antwoorden */}
        <div>
          <h3 className="text-lg font-medium mb-3">Klinisch Redeneren</h3>
          {cases.map((casus, index) => {
            const caseVersions = answerVersions[casus.id] || [];
            return (
              <div key={casus.id} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">{casus.title}</h4>
                <p className="mb-2 text-gray-600">{casus.caseDescription}</p>
                <p className="mb-3 font-medium">{casus.question}</p>
                
                {caseVersions.map((version, vIndex) => (
                  <div key={vIndex} className="mb-4 p-3 bg-white rounded border">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">Poging {version.version}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(version.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="font-medium">Analyse:</span>
                      <p className="mt-1">{version.answer}</p>
                    </div>
                    <div>
                      <span className="font-medium">Zelfbeoordeling:</span>
                      <span className="ml-2 capitalize">{version.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* ... existing certificate content ... */}
          {renderAppendix()}
        </div>
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}

export default Certificate; 