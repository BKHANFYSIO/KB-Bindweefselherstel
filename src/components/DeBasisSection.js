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
  const [currentToelichtingGoed, setCurrentToelichtingGoed] = useState('');
  const [currentToelichtingBeter, setCurrentToelichtingBeter, setCurrentScore] = useState('');
  const [showBoek, setShowBoek] = useState(false);
  const [showBraindumpIntro, setShowBraindumpIntro] = useState(true);
  const [showBasisIntro, setShowBasisIntro] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Opslaan in localStorage bij wijziging
  useEffect(() => {
    localStorage.setItem(BRAINDUMP_STORAGE_KEY, JSON.stringify(braindumps));
  }, [braindumps]);

  // Braindump toevoegen
  const handleAddBraindump = (score) => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!currentTitle.trim() || !currentBraindump.trim() || !currentToelichting.trim()) {
      setErrorMsg('Vul alle verplichte velden in voordat je een beoordeling kiest.');
      return;
    }
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
    setSuccessMsg('Braindump succesvol opgeslagen!');
  };

  // ChatGPT prompt genereren
  const generateChatGPTLink = (text) => {
    const prompt = `Geef constructieve feedback op deze braindump over bindweefselherstel, geef tips voor verdieping en leg uit wat goed is en wat beter kan. Braindump: ${text}`;
    return `https://chat.openai.com/?q=${encodeURIComponent(prompt)}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-8">
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
                Welkom bij De Basis! Dit is je startpunt voor het leren over bindweefselherstel. Hier vind je alle fundamentele kennis die je nodig hebt om het onderwerp goed te begrijpen. Of je nu net begint of je kennis wilt opfrissen, dit onderdeel biedt een solide basis met duidelijke uitleg en betrouwbare en diverse soorten bronnen. Neem de tijd om de stof goed door te nemen - een stevige basis maakt het leren van complexere onderwerpen later veel makkelijker. Je kiest zelf hoeveel en welke bronnen je gebruikt. Het vergelijken van verschillende bronnen is waardevol, zeker als je verschillen tegenkomt. Dat kan soms verwarrend zijn, maar zorgt vaak voor dieper leren – vooral als je daarover in gesprek gaat met een medestudent, docent of AI.
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
            <p className="text-yellow-900 font-semibold mb-2">Bestudeer in dit hoofdstuk één of meerdere bronnen en doe daarna meteen een braindump.</p>
            <p className="text-gray-700 mb-3">
              Een braindump is een krachtige leerstrategie: schrijf na het bekijken, lezen of luisteren uit je hoofd op wat je hebt geleerd. <b>Schrijf bij een braindump zo veel mogelijk op wat je nog weet over het onderwerp.</b> Het mag – of moet zelfs – moeilijk voelen: juist dan worden er nieuwe verbindingen in je brein gelegd en kom je tot diep leren. Dit helpt je brein om informatie écht op te slaan in het langetermijngeheugen. Je bepaalt zelf over welke bron(nen) of deelonderwerpen je een braindump maakt. Je kunt meerdere braindumps maken, bijvoorbeeld over verschillende bronnen of onderwerpen.
            </p>
            <b>Werkwijze:</b>
            <ol className="list-decimal ml-6 text-gray-700">
              <li>Bestudeer naar keuze één of meerdere bronnen.</li>
              <li>Geef je braindump een titel die de inhoud van de braindump dekt of weerspiegelt.</li>
              <li>Schrijf je braindump.</li>
              <li>Vraag feedback via ChatGPT.</li>
              <li>Beoordeel zelf je braindump en geef een korte toelichting. Sla je braindump automatisch op door op een van de knoppen te klikken.</li>
            </ol>
          </div>
        )}
        {/* Stap 1 */}
        <div className="mb-4">
          <h4 className="font-bold text-yellow-900 mb-1">Stap 1: Titel en braindump</h4>
          <p className="text-gray-700 text-sm mb-2">Kies een duidelijke titel en schrijf hieronder je braindump. Dit helpt je om actief te leren!</p>
          <input
            className="w-full border rounded-md p-2 mb-2"
            placeholder="Titel van je braindump (bijv. 'Bindweefsel fasen')"
            value={currentTitle}
            onChange={e => setCurrentTitle(e.target.value)}
          />
          <textarea
            className="w-full border rounded-md p-2 mb-2 min-h-[80px]"
            placeholder="Typ hier je braindump..."
            value={currentBraindump}
            onChange={e => setCurrentBraindump(e.target.value)}
          />
          <span className="text-xs text-gray-500 block mb-2">Dus alles wat je er nog over weet. Stop niet te snel, het mag of moet zelfs moeilijk voelen.</span>
        </div>
        {/* Stap 2 */}
        <div className="mb-4">
          <h4 className="font-bold text-yellow-900 mb-1">Stap 2: Feedback verzamelen (optioneel)</h4>
          <p className="text-gray-700 text-sm mb-2">Feedback kan komen van ChatGPT, een medestudent of van jezelf na het terugkijken van bronnen. Je kunt hieronder optioneel feedback vragen via ChatGPT.</p>
          <a
            href={generateChatGPTLink(currentBraindump)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-md transition text-sm mt-2 inline-block"
          >
            Vraag feedback via ChatGPT
          </a>
        </div>
        {/* Stap 3 */}
        <div className="mb-4">
          <h4 className="font-bold text-yellow-900 mb-1">Stap 3: Zelfbeoordeling en toelichting</h4>
          <p className="text-gray-700 text-sm mb-2">Reflecteer op je braindump: wat ging goed en wat kan beter? Geef daarna aan hoe goed je denkt dat je braindump is.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block text-gray-800 font-medium mb-1">Wat gaat goed? <span className="text-red-500">*</span></label>
              <textarea
                className="w-full border rounded-md p-2 mb-2 min-h-[60px]"
                placeholder="Noem minimaal één sterk punt van je braindump..."
                value={currentToelichtingGoed}
                onChange={e => setCurrentToelichtingGoed(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-800 font-medium mb-1">Wat kan beter? <span className="text-red-500">*</span></label>
              <textarea
                className="w-full border rounded-md p-2 mb-2 min-h-[60px]"
                placeholder="Waar zie je ruimte voor verbetering?"
                value={currentToelichtingBeter}
                onChange={e => setCurrentToelichtingBeter(e.target.value)}
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-gray-800 font-medium mb-1">Hoe goed was je braindump?</label>
          </div>
          <div className="flex flex-wrap gap-4 mb-2">
            {['Matig', 'Redelijk', 'Goed'].map(opt => (
              <button
                key={opt}
                onClick={() => handleAddBraindump(opt)}
                className={`px-6 py-2 rounded font-bold text-white text-lg shadow ${opt === 'Matig' ? 'bg-red-500 hover:bg-red-600' : opt === 'Redelijk' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
              >
                {opt}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-500 block mt-1">Sla je braindump automatisch op door op een van de knoppen te klikken.</span>
          {errorMsg && <div className="mt-2 text-red-600 font-semibold">{errorMsg}</div>}
          {successMsg && <div className="mt-2 text-green-700 font-semibold">{successMsg}</div>}
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
                    <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${bd.score === 'Matig' ? 'bg-red-600' : bd.score === 'Redelijk' ? 'bg-yellow-600' : 'bg-green-600'}`}>{bd.score}</span>
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

      {/* Fase-tabel met alternatieve termen */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-blue-700 mb-2">Overzicht fasen van bindweefselherstel</h3>
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-300 rounded-lg text-sm">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-3 py-2 border">Fase (NL)</th>
                <th className="px-3 py-2 border">Alternatieve termen (NL)</th>
                <th className="px-3 py-2 border">Engelse term</th>
                <th className="px-3 py-2 border">Kernproces</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-3 py-2">Homeostase</td>
                <td className="border px-3 py-2">Hemostase, acute fase</td>
                <td className="border px-3 py-2">Hemostasis</td>
                <td className="border px-3 py-2">Bloedstelping, stolling</td>
              </tr>
              <tr>
                <td className="border px-3 py-2">Ontstekingsfase</td>
                <td className="border px-3 py-2">Inflammatiefase</td>
                <td className="border px-3 py-2">Inflammation phase</td>
                <td className="border px-3 py-2">Opruimen, ontsteking</td>
              </tr>
              <tr>
                <td className="border px-3 py-2">Proliferatiefase</td>
                <td className="border px-3 py-2">Granulatiefase, regeneratiefase</td>
                <td className="border px-3 py-2">Proliferation phase</td>
                <td className="border px-3 py-2">Weefselopbouw, celdeling</td>
              </tr>
              <tr>
                <td className="border px-3 py-2">Vroege remodelleringsfase</td>
                <td className="border px-3 py-2">Vroege reorganisatiefase</td>
                <td className="border px-3 py-2">Early remodeling phase</td>
                <td className="border px-3 py-2">Matrix reorganisatie</td>
              </tr>
              <tr>
                <td className="border px-3 py-2">Late remodelleringsfase</td>
                <td className="border px-3 py-2">Late reorganisatiefase</td>
                <td className="border px-3 py-2">Late remodeling phase</td>
                <td className="border px-3 py-2">Uitlijning, versterking</td>
              </tr>
              <tr>
                <td className="border px-3 py-2">Integratiefase</td>
                <td className="border px-3 py-2">Maturatiefase</td>
                <td className="border px-3 py-2">Maturation/integration phase</td>
                <td className="border px-3 py-2">Functionele integratie</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-xs text-gray-500 mt-2">Bronnen: Landen et al. 2016; Culav et al. 1999; Cook & Purdam 2009; Khan & Scott 2009; zie ook het studieboek onderaan deze pagina.</div>
      </div>

      {/* Fasen en video's in grid */}
      <div className="mb-8">
        <h3 className="text-xl font-medium text-gray-800 mt-6 mb-4">Fasen van Bindweefselherstel</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-4 flex flex-col">
            <h4 className="text-lg font-semibold mb-2">Homeostase (Hemostase)</h4>
            <p className="text-gray-700 mb-2">Direct na letsel treedt de homeostasefase op: bloedplaatjes zorgen voor stolling en vormen een voorlopige matrix. Dit stopt het bloeden en vormt de basis voor herstel. <span className="text-blue-700 font-medium">Zie video voor meer uitleg.</span></p>
            <div className="aspect-w-16 aspect-h-9 mb-2"><iframe className="w-full h-48" src="https://www.youtube.com/embed/8-x9RKv-bXY" title="De ontstekingsfase" frameBorder="0" allowFullScreen></iframe></div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col">
            <h4 className="text-lg font-semibold mb-2">Ontstekingsfase (Inflammatie)</h4>
            <p className="text-gray-700 mb-2">In deze fase ruimt het lichaam beschadigd weefsel en pathogenen op. Ontstekingscellen en mediatoren zorgen voor bescherming en voorbereiding op herstel. <span className="text-blue-700 font-medium">Zie video voor meer uitleg.</span></p>
            <div className="aspect-w-16 aspect-h-9 mb-2"><iframe className="w-full h-48" src="https://www.youtube.com/embed/8-x9RKv-bXY" title="De ontstekingsfase" frameBorder="0" allowFullScreen></iframe></div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col">
            <h4 className="text-lg font-semibold mb-2">Proliferatiefase</h4>
            <p className="text-gray-700 mb-2">Nieuwe cellen en bloedvaten worden gevormd. Fibroblasten maken collageen en andere matrixcomponenten aan. <span className="text-blue-700 font-medium">Zie video voor meer uitleg.</span></p>
            <div className="aspect-w-16 aspect-h-9 mb-2"><iframe className="w-full h-48" src="https://www.youtube.com/embed/fWecGdjEuxc" title="De proliferatiefase" frameBorder="0" allowFullScreen></iframe></div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col">
            <h4 className="text-lg font-semibold mb-2">Remodelleringsfase (Vroeg & Laat)</h4>
            <p className="text-gray-700 mb-2">Collageen wordt sterker en beter uitgelijnd. In de vroege fase vindt reorganisatie plaats, in de late fase verdere versterking en uitlijning. <span className="text-blue-700 font-medium">Zie video voor meer uitleg.</span></p>
            <div className="aspect-w-16 aspect-h-9 mb-2"><iframe className="w-full h-48" src="https://www.youtube.com/embed/fWecGdjEuxc" title="De remodelleringsfase" frameBorder="0" allowFullScreen></iframe></div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col md:col-span-2">
            <h4 className="text-lg font-semibold mb-2">Integratiefase (Maturatie)</h4>
            <p className="text-gray-700 mb-2">Het weefsel wordt functioneel geïntegreerd in het lichaam. Kracht, structuur en functie worden verder geoptimaliseerd. <span className="text-blue-700 font-medium">Zie video voor meer uitleg.</span></p>
            <div className="aspect-w-16 aspect-h-9 mb-2"><iframe className="w-full h-48" src="https://www.youtube.com/embed/N-Vi31TdCII" title="Integratiefase" frameBorder="0" allowFullScreen></iframe></div>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-2">Bronnen: Landen et al. 2016; Culav et al. 1999; Cook & Purdam 2009; Khan & Scott 2009; zie ook het studieboek onderaan deze pagina.</div>
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