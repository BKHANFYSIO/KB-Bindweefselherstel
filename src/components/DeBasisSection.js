import React, { useState, useEffect } from 'react';

const BRAINDUMP_STORAGE_KEY = 'basisBraindumps';

function DeBasisSection() {
  // Braindump state
  const [braindumps, setBraindumps] = useState(() => {
    const saved = localStorage.getItem(BRAINDUMP_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [currentBraindump, setCurrentBraindump] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentToelichting, setCurrentToelichting] = useState('');
  const [currentScore, setCurrentScore] = useState('');
  const [showBoek, setShowBoek] = useState(false);
  const [showBraindumpIntro, setShowBraindumpIntro] = useState(true);
  const [showBasisIntro, setShowBasisIntro] = useState(true);

  // Opslaan in localStorage bij wijziging
  useEffect(() => {
    localStorage.setItem(BRAINDUMP_STORAGE_KEY, JSON.stringify(braindumps));
  }, [braindumps]);

  // Braindump toevoegen
  const handleAddBraindump = (score) => {
    if (!currentBraindump.trim() || !currentTitle.trim() || !score || !currentToelichting.trim()) return;
    setBraindumps([
      ...braindumps,
      {
        title: currentTitle,
        text: currentBraindump,
        toelichting: currentToelichting,
        score,
        date: new Date().toISOString(),
      },
    ]);
    setCurrentBraindump('');
    setCurrentTitle('');
    setCurrentToelichting('');
  };

  // ChatGPT prompt genereren
  const generateChatGPTLink = (text) => {
    const prompt = `Geef constructieve feedback op deze braindump over bindweefselherstel, geef tips voor verdieping en leg uit wat goed is en wat beter kan. Braindump: ${text}`;
    return `https://chat.openai.com/?q=${encodeURIComponent(prompt)}`;
  };

  return (
    <div className="space-y-8">
      {/* Samenvatting en verdieping */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-blue-700 mb-2">De Basis</h2>
        <div className="mb-4">
          <button
            className="text-blue-700 font-semibold mb-2 focus:outline-none flex items-center gap-2"
            onClick={() => setShowBasisIntro((prev) => !prev)}
            aria-expanded={showBasisIntro}
            aria-controls="basis-intro"
          >
            {showBasisIntro ? '▼' : '►'} Inleiding
          </button>
          {showBasisIntro && (
            <div id="basis-intro" className="bg-blue-50 p-6 rounded-lg shadow-sm">
              <p className="text-gray-700 leading-relaxed mb-2">
                Welkom bij De Basis! Dit is je startpunt voor het leren over bindweefselherstel. Hier vind je alle fundamentele kennis die je nodig hebt om het onderwerp goed te begrijpen. Of je nu net begint of je kennis wilt opfrissen, dit onderdeel biedt een solide basis met duidelijke uitleg en betrouwbare bronnen. Neem de tijd om de stof goed door te nemen - een stevige basis maakt het leren van complexere onderwerpen later veel makkelijker.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Wil je verder verdiepen? Bekijk het online boek of de video's hieronder. Meer bronnen volgen binnenkort!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Braindump functionaliteit */}
      <div className="bg-yellow-50 p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-2">
          <img src={require('../assets/Brein-icoontje-kennisbooster.png')} alt="Brein icoon" className="w-8 h-8 mr-3" />
          <h3 className="text-xl font-semibold text-yellow-800">Braindump: Actief leren voor je brein</h3>
        </div>
        <button
          className="text-yellow-800 font-semibold mb-2 focus:outline-none flex items-center gap-2"
          onClick={() => setShowBraindumpIntro((prev) => !prev)}
          aria-expanded={showBraindumpIntro}
          aria-controls="braindump-intro"
        >
          {showBraindumpIntro ? '▼' : '►'} Inleiding & Werkwijze
        </button>
        {showBraindumpIntro && (
          <div id="braindump-intro" className="bg-yellow-100 p-4 rounded-lg shadow-sm mb-4">
            <p className="text-gray-700 mb-3">
              Een braindump is een krachtige leerstrategie: schrijf na het bekijken, lezen of luisteren uit je hoofd op wat je hebt geleerd. Dit helpt je brein om informatie écht op te slaan in het langetermijngeheugen. Je bepaalt zelf over welke bron(nen) of deelonderwerpen je een braindump maakt. Je kunt meerdere braindumps maken, bijvoorbeeld over verschillende bronnen of onderwerpen. <br />
              <b>Werkwijze:</b><br />
              1. Kies een bron of onderwerp en geef je braindump een titel.<br />
              2. Schrijf je braindump.<br />
              3. Vraag feedback via ChatGPT.<br />
              4. Beoordeel zelf je braindump en geef een korte toelichting. Sla je braindump automatisch op door op een van de knoppen te klikken.
            </p>
          </div>
        )}
        <input
          className="w-full border rounded-md p-2 mb-2"
          placeholder="Titel van je braindump (zelf kiezen)"
          value={currentTitle}
          onChange={e => setCurrentTitle(e.target.value)}
        />
        <textarea
          className="w-full border rounded-md p-2 mb-2 min-h-[80px]"
          placeholder="Typ hier je braindump..."
          value={currentBraindump}
          onChange={e => setCurrentBraindump(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 mb-2">
          <a
            href={generateChatGPTLink(currentBraindump)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-1 px-4 rounded-md transition text-sm"
          >
            Stap 1: Vraag feedback via ChatGPT
          </a>
        </div>
        <div className="mb-2">
          <span className="text-gray-700 mr-2 font-semibold">Stap 2: Oordeel zelf en geef een korte toelichting</span>
          <input
            className="w-full border rounded-md p-2 mt-2 mb-2"
            placeholder="Waarom geef je jezelf deze beoordeling? (verplicht)"
            value={currentToelichting}
            onChange={e => setCurrentToelichting(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {['Nee', 'Redelijk', 'Goed'].map(opt => (
              <button
                key={opt}
                onClick={() => handleAddBraindump(opt)}
                className={`px-3 py-1 rounded font-medium text-white ${opt === 'Nee' ? 'bg-red-500 hover:bg-red-600' : opt === 'Redelijk' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
                disabled={!currentBraindump.trim() || !currentTitle.trim() || !currentToelichting.trim()}
              >
                {opt}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-500 block mt-1">Sla je braindump automatisch op door op een van de knoppen te klikken.</span>
        </div>
        {braindumps.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2 text-gray-800">Jouw eerdere braindumps</h4>
            <ul className="space-y-2">
              {braindumps.map((bd, idx) => (
                <li key={idx} className="border rounded p-2 bg-white flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-1 md:mb-0">
                    <span className="block text-gray-700 text-sm mb-1">{new Date(bd.date).toLocaleString('nl-NL')}</span>
                    <span className="block text-gray-900 font-semibold">{bd.title}</span>
                    <span className="block text-gray-900">{bd.text}</span>
                    <span className="block text-gray-600 text-xs italic">Toelichting: {bd.toelichting}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${bd.score === 'Nee' ? 'bg-red-600' : bd.score === 'Redelijk' ? 'bg-yellow-600' : 'bg-green-600'}`}>{bd.score}</span>
                    <a
                      href={generateChatGPTLink(bd.text)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-purple-700 underline text-xs"
                    >
                      Feedback via ChatGPT
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Fasen en video's */}
      <div className="prose max-w-none">
        <h3 className="text-xl font-medium text-gray-800 mt-6">Introductie tot Bindweefsel</h3>
        <p className="text-gray-700 leading-relaxed">
          Bindweefsel is een van de vier fundamentele weefseltypen in het menselijk lichaam, naast spierweefsel, 
          epitheelweefsel en zenuwweefsel. Het is overal in het lichaam aanwezig en vervult cruciale functies 
          in structuur, ondersteuning en verbinding van andere weefsels en organen.
        </p>

        <h3 className="text-xl font-medium text-gray-800 mt-6">Fasen van Bindweefselherstel</h3>
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-2">De ontstekingsfase</h4>
          <div className="aspect-w-16 aspect-h-9 mb-4"><iframe className="w-full h-64" src="https://www.youtube.com/embed/8-x9RKv-bXY" title="De ontstekingsfase" frameBorder="0" allowFullScreen></iframe></div>
        </div>
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-2">De proliferatiefase</h4>
          <div className="aspect-w-16 aspect-h-9 mb-4"><iframe className="w-full h-64" src="https://www.youtube.com/embed/fWecGdjEuxc" title="De proliferatiefase" frameBorder="0" allowFullScreen></iframe></div>
        </div>
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-2">De remodelleringsfase</h4>
          <div className="aspect-w-16 aspect-h-9 mb-4"><iframe className="w-full h-64" src="https://www.youtube.com/embed/fWecGdjEuxc" title="De remodelleringsfase" frameBorder="0" allowFullScreen></iframe></div>
        </div>
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-2">Integratiefase</h4>
          <div className="aspect-w-16 aspect-h-9 mb-4"><iframe className="w-full h-64" src="https://www.youtube.com/embed/N-Vi31TdCII" title="Integratiefase" frameBorder="0" allowFullScreen></iframe></div>
        </div>

        <h3 className="text-xl font-medium text-gray-800 mt-6">Componenten van Bindweefsel</h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>
            <strong>Cellen:</strong> Voornamelijk fibroblasten, die verantwoordelijk zijn voor de productie 
            van extracellulaire matrix componenten.
          </li>
          <li>
            <strong>Vezels:</strong> Collageen (voor sterkte), elastine (voor elasticiteit) en reticuline 
            (voor structurele ondersteuning).
          </li>
          <li>
            <strong>Grondsubstantie:</strong> Een gel-achtige substantie die cellen en vezels omgeeft, 
            bestaande uit water, proteoglycanen en glycoproteïnen.
          </li>
        </ul>

        <h3 className="text-xl font-medium text-gray-800 mt-6">Functies van Bindweefsel</h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Verbinding en ondersteuning van andere weefsels en organen</li>
          <li>Opslag van voedingsstoffen en water</li>
          <li>Bescherming tegen mechanische belasting</li>
          <li>Immunologische verdediging</li>
          <li>Wondgenezing en weefselreparatie</li>
        </ul>

        <h3 className="text-xl font-medium text-gray-800 mt-6">Types Bindweefsel</h3>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>
            <strong>Los bindweefsel:</strong> Flexibel, met relatief weinig vezels (bijv. onder de huid)
          </li>
          <li>
            <strong>Dicht bindweefsel:</strong> Stevig, met veel collageenvezels (bijv. pezen en ligamenten)
          </li>
          <li>
            <strong>Speciaal bindweefsel:</strong> Met specifieke eigenschappen (bijv. vetweefsel, kraakbeen, bot)
          </li>
        </ul>

        <h3 className="text-xl font-medium text-gray-800 mt-6">Klinische Relevantie</h3>
        <p className="text-gray-700 leading-relaxed">
          Begrip van bindweefsel is essentieel voor fysiotherapeuten omdat het betrokken is bij veel 
          pathologische processen en blessures. Van sportblessures tot chronische aandoeningen, 
          bindweefsel speelt een centrale rol in zowel het ontstaan van klachten als het herstelproces.
        </p>
      </div>

      {/* Modal met het boek */}
      {showBoek && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-5xl w-full relative">
            <button
              onClick={() => setShowBoek(false)}
              className="absolute top-4 right-4 text-gray-700 hover:text-white hover:bg-red-600 transition-all text-3xl font-bold rounded-full w-12 h-12 flex items-center justify-center shadow focus:outline-none focus:ring-2 focus:ring-red-400 z-10"
              aria-label="Sluiten"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
            >
              &times;
            </button>
            <iframe
              src="/Bronnen/AI_boek_bindweefselherstel.html"
              title="Online Boek Bindweefselherstel"
              className="w-full h-[80vh] border-0 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Boek sectie onderaan */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold text-blue-700 mb-4">Online studieboek (AI gegenereerd)</h3>
        <div className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-4 rounded">
          <p className="mb-2 text-gray-800">
            Dit digitale studieboek is met behulp van een AI-agent samengesteld. Het biedt een uitgebreide verdieping over bindweefselherstel. Let op: hoewel het boek zorgvuldig is samengesteld, kunnen er fouten of onduidelijkheden in staan. Zie je iets opvallends of twijfel je aan de inhoud? Bespreek dit met medestudenten of docenten en geef het aan ons door. Samen maken we het materiaal steeds beter!
          </p>
          <button
            onClick={() => setShowBoek(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-md shadow transition"
          >
            Bekijk het online boek
          </button>
        </div>
      </div>

      {/* Aangrenzende bronnen */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold text-blue-700 mb-4">Aangrenzende bronnen</h3>
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-2">De fibroblast</h4>
          <div className="aspect-w-16 aspect-h-9 mb-4"><iframe className="w-full h-64" src="https://www.youtube.com/embed/N-Vi31TdCII" title="De fibroblast" frameBorder="0" allowFullScreen></iframe></div>
        </div>
        {/* Hier kun je later meer bronnen toevoegen */}
      </div>
    </div>
  );
}

export default DeBasisSection; 