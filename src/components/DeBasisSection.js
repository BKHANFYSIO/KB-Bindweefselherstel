import React, { useState, useEffect } from 'react';
import usePersistentToggle from './usePersistentToggle';

const BRAINDUMP_STORAGE_KEY = 'basisBraindumps';

function DeBasisSection({ kennisBoosterTitel = 'Bindweefselherstel' }) {
  // State management
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
  const [showBraindumpIntro, toggleBraindumpIntro] = usePersistentToggle('de_basis_braindump_intro', true);
  const [showBasisIntro, toggleBasisIntro] = usePersistentToggle('de_basis_intro', true);
  const [showBraindumpSection, toggleBraindumpSection] = usePersistentToggle('de_basis_braindump_section', true);
  const [showBindweefselUitleg, toggleBindweefselUitleg] = usePersistentToggle('bindweefsel_uitleg', true);
  const [showBronnen, toggleBronnen] = usePersistentToggle('belangrijke_bronnen', true);
  const [showAangrenzend, toggleAangrenzend] = usePersistentToggle('aangrenzende_bronnen', true);
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
    if (!currentTitle.trim() || !currentBraindump.trim() || !currentToelichtingGoed.trim() || !currentToelichtingBeter.trim()) {
      setErrorMsg('Vul alle verplichte velden in voordat je een beoordeling kiest.');
      return;
    }
    setBraindumps([
      ...braindumps,
      {
        title: currentTitle,
        text: currentBraindump,
        toelichtingGoed: currentToelichtingGoed,
        toelichtingBeter: currentToelichtingBeter,
        score,
        date: new Date().toISOString(),
      },
    ]);
    setCurrentBraindump('');
    setCurrentTitle('');
    setCurrentToelichtingGoed('');
    setCurrentToelichtingBeter('');
    setSuccessMsg('Braindump succesvol opgeslagen!');
  };

  // ChatGPT prompt genereren
  const generateChatGPTLink = (title, text) => {
    const prompt = `Jij bent docent fysiotherapie.\nGeef constructieve en inhoudelijke feedback op deze braindump van een student fysiotherapie over ${kennisBoosterTitel}. Benoem wat de student al goed doet en wat nog beter kan, en geef concrete tips voor verbetering en verdere verdieping.\n\nDe student heeft aangegeven specifiek deze braindump te hebben gemaakt over het onderwerp: ${title}\n\nBraindump van de student:\n${text}\n\nOpdracht aan jou:\n\nGeef eerst een korte, positieve samenvatting van wat goed gaat.\n\nBenoem vervolgens welke inhoud mist of beter uitgewerkt kan worden.\n\nSluit af met de uitnodiging aan de student om de braindump op basis van de feedback aan te passen en eventueel opnieuw in te dienen voor feedback. Je mag ook suggesties doen voor verdere verdieping over het onderwerp: ${title}.`;
    return `https://chat.openai.com/?q=${encodeURIComponent(prompt)}`;
  };

  // Helper function voor chapter headers
  const ChapterHeader = ({ title, isOpen, onToggle, icon }) => (
    <button
      onClick={onToggle}
      className="w-full text-left bg-blue-50 hover:bg-blue-100 transition-colors duration-200 p-4 rounded-lg shadow-sm mb-4 group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <span className="text-blue-600 text-xl">{icon}</span>}
          <h3 className="text-xl font-semibold text-blue-700">{title}</h3>
        </div>
        <span className={`text-blue-600 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </div>
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* De Basis intro */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-blue-700 mb-2">De Basis</h2>
        <div className="mb-4">
          <button
            className="text-blue-700 font-semibold mb-2 focus:outline-none flex items-center gap-2"
            onClick={toggleBasisIntro}
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

      {/* Braindump Section */}
      <div className="mb-8">
        <ChapterHeader
          title="Braindump: Actief leren voor je brein"
          isOpen={showBraindumpSection}
          onToggle={toggleBraindumpSection}
          icon="🧠"
        />
        {showBraindumpSection && (
          <div className="bg-yellow-50 p-6 rounded-lg shadow-md mb-8 animate-fadeIn">
            <button
              className="text-yellow-800 font-semibold mb-2 focus:outline-none flex items-center gap-2"
              onClick={toggleBraindumpIntro}
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
                href={generateChatGPTLink(currentTitle, currentBraindump)}
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
                          href={generateChatGPTLink(bd.title, bd.text)}
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
        )}
      </div>

      {/* Bindweefselherstel Uitgelegd */}
      <div className="mb-8">
        <ChapterHeader
          title="Bindweefselherstel Uitgelegd"
          isOpen={showBindweefselUitleg}
          onToggle={toggleBindweefselUitleg}
          icon="📚"
        />
        {showBindweefselUitleg && (
          <div className="space-y-6 animate-fadeIn">
            {/* Introductie kader */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-400 rounded-lg p-6 shadow-lg">
              <h4 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
                <span className="text-xl">💡</span> Over dit hoofdstuk
              </h4>
              <p className="text-gray-700 mb-4">
                In dit hoofdstuk nemen we je stap voor stap mee door het proces van bindweefselherstel. Je vindt hier een 
                beknopte maar complete uitleg, ondersteund door visuele elementen en verdiepende bronnen. We combineren:
              </p>
              <ul className="list-none space-y-2 mb-4">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-blue-500">✓</span> Een overzichtelijke tijdlijn van het herstelproces
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-blue-500">✓</span> Heldere uitleg van elke fase met korte video's
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-blue-500">✓</span> Praktische terminologie voor in de literatuur
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-blue-500">✓</span> Kernprocessen en belangrijkste celtypen
                </li>
              </ul>
              <div className="text-sm text-blue-600 italic">
                Tip: Gebruik de video's als visuele ondersteuning bij de tekst. Ze helpen je om de processen beter te begrijpen en onthouden.
              </div>
            </div>

            {/* Interactieve navigatie */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <button 
                onClick={() => document.getElementById('overzicht').scrollIntoView({ behavior: 'smooth' })}
                className="p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-center text-sm text-blue-700 hover:bg-blue-50"
              >
                🔄 Overzicht Proces
              </button>
              <button 
                onClick={() => document.getElementById('fasen-tabel').scrollIntoView({ behavior: 'smooth' })}
                className="p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-center text-sm text-blue-700 hover:bg-blue-50"
              >
                📋 Terminologie
              </button>
              <button 
                onClick={() => document.getElementById('fasen-videos').scrollIntoView({ behavior: 'smooth' })}
                className="p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-center text-sm text-blue-700 hover:bg-blue-50"
              >
                🎥 Video's per Fase
              </button>
              <button 
                onClick={() => document.getElementById('celtypen').scrollIntoView({ behavior: 'smooth' })}
                className="p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-center text-sm text-blue-700 hover:bg-blue-50"
              >
                🔬 Belangrijke Cellen
              </button>
            </div>

            {/* Overzichtsafbeelding */}
            <div id="overzicht" className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="relative aspect-[4/3] w-full">
                <img 
                  src="/Bronnen/Fases_van_herstel.png" 
                  alt="Overzicht van de fasen van bindweefselherstel" 
                  className="rounded-lg object-contain w-full h-full"
                />
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-3">Overzicht Herstelproces</h4>
                <p className="text-gray-700">
                  Deze afbeelding toont het complete proces van bindweefselherstel, van de acute fase tot aan de integratiefase. 
                  Het herstelproces verloopt geleidelijk, waarbij de fasen in elkaar overlopen. De tijdsduur van elke fase kan 
                  variëren afhankelijk van verschillende factoren zoals de ernst van het letsel, de locatie, en individuele 
                  factoren zoals leeftijd en gezondheid.
                </p>
              </div>
            </div>

            {/* Fase-tabel */}
            <div id="fasen-tabel" className="bg-white rounded-lg shadow p-1 sm:p-6 mb-6">
              <h4 className="text-lg font-semibold mb-3">Overzicht Fasen en Terminologie</h4>
              <p className="text-gray-700 mb-4">
                Deze tabel geeft een overzicht van de belangrijkste fasen in bindweefselherstel, inclusief alternatieve benamingen 
                die je in de literatuur kunt tegenkomen. Voor elke fase zijn de kernprocessen beschreven die kenmerkend zijn voor die periode.
              </p>
              <div className="overflow-x-auto max-w-full px-0">
                <table className="w-full divide-y divide-gray-300 bg-white border border-gray-300 rounded-lg text-sm hyphens-auto">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="px-3 py-2 border break-words w-1/6 min-w-[90px]">Fase (NL)</th>
                      <th className="px-3 py-2 border break-words w-2/6 min-w-[120px] max-w-[220px]">Alternatieve termen (NL)</th>
                      <th className="px-3 py-2 border break-words w-1/6 min-w-[90px]">Engelse term</th>
                      <th className="px-3 py-2 border break-words w-2/6 min-w-[120px] max-w-[200px]">Kernproces</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300">
                    <tr>
                      <td className="border px-3 py-2 break-words w-1/6 min-w-[90px]">Homeostase</td>
                      <td className="border px-3 py-2 break-words w-2/6 min-w-[120px] max-w-[220px]">Hemostase, acute fase</td>
                      <td className="border px-3 py-2 break-words w-1/6 min-w-[90px]">Hemostasis</td>
                      <td className="border px-3 py-2 break-words w-2/6 min-w-[120px] max-w-[200px]">Bloedstelping, stolling</td>
                    </tr>
                    <tr>
                      <td className="border px-3 py-2 break-words w-1/6 min-w-[90px]">Ontstekingsfase</td>
                      <td className="border px-3 py-2 break-words w-2/6 min-w-[120px] max-w-[220px]">Inflammatiefase</td>
                      <td className="border px-3 py-2 break-words w-1/6 min-w-[90px]">Inflammation phase</td>
                      <td className="border px-3 py-2 break-words w-2/6 min-w-[120px] max-w-[200px]">Opruimen, ontsteking</td>
                    </tr>
                    <tr>
                      <td className="border px-3 py-2 break-words w-1/6 min-w-[90px]">Proliferatiefase</td>
                      <td className="border px-3 py-2 break-words w-2/6 min-w-[120px] max-w-[220px]">Granulatiefase, regeneratiefase</td>
                      <td className="border px-3 py-2 break-words w-1/6 min-w-[90px]">Proliferation phase</td>
                      <td className="border px-3 py-2 break-words w-2/6 min-w-[120px] max-w-[200px]">Weefselopbouw, celdeling</td>
                    </tr>
                    <tr>
                      <td className="border px-3 py-2 break-words w-1/6 min-w-[90px]">Remodelleringsfase</td>
                      <td className="border px-3 py-2 break-words w-2/6 min-w-[120px] max-w-[220px]">Vroege/late remodelleringsfase, reorganisatiefase, integratiefase, maturatiefase</td>
                      <td className="border px-3 py-2 break-words w-1/6 min-w-[90px]">Remodeling phase</td>
                      <td className="border px-3 py-2 break-words w-2/6 min-w-[120px] max-w-[200px]">Matrix reorganisatie, uitlijning, versterking</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-gray-500 mt-2">Bronnen: Landen et al. 2016; Culav et al. 1999; Cook & Purdam 2009; Khan & Scott 2009</div>
            </div>

            {/* Fasen met video's */}
            <div id="fasen-videos" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
                <h4 className="text-lg font-semibold mb-3">Homeostase (Hemostase)</h4>
                <p className="text-gray-700 mb-4 flex-grow">Direct na letsel treedt de homeostasefase op: bloedplaatjes zorgen voor stolling en vormen een voorlopige matrix. Dit stopt het bloeden en vormt de basis voor herstel. <span className="text-blue-700">De onderstaande video geeft een gedetailleerd beeld van dit proces. Let op: je hoeft niet alle details te kennen, focus op de hoofdlijnen van het proces.</span></p>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe 
                    className="w-full rounded-lg" 
                    src="https://www.youtube.com/embed/SriUGoLlHLs" 
                    title="Hemostase proces" 
                    frameBorder="0" 
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
                <h4 className="text-lg font-semibold mb-3">Ontstekingsfase (Inflammatie)</h4>
                <p className="text-gray-700 mb-4 flex-grow">In deze fase ruimt het lichaam beschadigd weefsel en pathogenen op. Ontstekingscellen en mediatoren zorgen voor bescherming en voorbereiding op herstel. <span className="text-blue-700">Zie video voor meer uitleg.</span></p>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe 
                    className="w-full rounded-lg" 
                    src="https://www.youtube.com/embed/8-x9RKv-bXY" 
                    title="De ontstekingsfase" 
                    frameBorder="0" 
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
                <h4 className="text-lg font-semibold mb-3">Proliferatiefase</h4>
                <p className="text-gray-700 mb-4 flex-grow">Nieuwe cellen en bloedvaten worden gevormd. Fibroblasten maken collageen en andere matrixcomponenten aan. <span className="text-blue-700">Zie video voor meer uitleg.</span></p>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe 
                    className="w-full rounded-lg" 
                    src="https://www.youtube.com/embed/fWecGdjEuxc" 
                    title="De proliferatiefase" 
                    frameBorder="0" 
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
                <h4 className="text-lg font-semibold mb-3">Remodelleringsfase</h4>
                <p className="text-gray-700 mb-4 flex-grow">In deze fase vindt verdere versterking en uitlijning van het weefsel plaats. De integratie met omliggend weefsel is cruciaal voor optimaal herstel. Het weefsel past zich aan aan de belasting en functie-eisen. <span className="text-blue-700">Bekijk beide video's voor een compleet beeld van deze fase.</span></p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe 
                      className="w-full rounded-lg" 
                      src="https://www.youtube.com/embed/I9jeffyqexg" 
                      title="Remodellering deel 1" 
                      frameBorder="0" 
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe 
                      className="w-full rounded-lg" 
                      src="https://www.youtube.com/embed/ydF6mxmbHjo" 
                      title="Remodellering deel 2" 
                      frameBorder="0" 
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>

            {/* Nieuwe sectie: Belangrijke celtypen */}
            <div id="celtypen" className="bg-white rounded-lg shadow p-6">
              <h4 className="text-lg font-semibold mb-3">Belangrijke Celtypen in Bindweefselherstel</h4>
              <p className="text-gray-700 mb-4">
                Voor een goed begrip van bindweefselherstel is kennis van de belangrijkste celtypen essentieel. 
                Hier zijn de meest relevante cellen en hun functies:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-700 mb-2">Fibroblasten</h5>
                  <p className="text-gray-700 text-sm">De belangrijkste cellen in bindweefsel. Ze produceren collageen en andere componenten van de extracellulaire matrix.</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-700 mb-2">Ontstekingscellen</h5>
                  <p className="text-gray-700 text-sm">Waaronder neutrofielen en macrofagen. Cruciaal in de vroege fase voor opruimen van debris en stimuleren van herstel.</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-700 mb-2">Endotheelcellen</h5>
                  <p className="text-gray-700 text-sm">Vormen nieuwe bloedvaten tijdens de proliferatiefase, essentieel voor de aanvoer van voedingsstoffen.</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-700 mb-2">Myofibroblasten</h5>
                  <p className="text-gray-700 text-sm">Gespecialiseerde fibroblasten die zorgen voor contractie en reorganisatie van het weefsel tijdens remodellering.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Belangrijke Bronnen */}
      <div className="mb-8">
        <ChapterHeader
          title="Belangrijke Bronnen"
          isOpen={showBronnen}
          onToggle={toggleBronnen}
          icon="📖"
        />
        {showBronnen && (
          <div className="space-y-6 animate-fadeIn">
            {/* Boek Dynamiek van Bindweefsel */}
            <div className="bg-purple-50 border-l-4 border-purple-400 rounded-lg shadow-lg overflow-hidden">
              <a 
                href="http://stcproxy.han.nl/han/hanquest/search.ebscohost.com/login.aspx?direct=true&db=nlebk&AN=2923131&lang=nl&site=eds-live&scope=site"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                  <div className="relative aspect-[3/4] w-full">
                    <img 
                      src="/Bronnen/boek_dynamiek_van_bindweefsel.jpg"
                      alt="Boek: Dynamiek van het menselijk bindweefsel"
                      className="object-cover w-full h-full rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="text-xl font-semibold text-purple-700 mb-3">Dynamiek van het menselijk bindweefsel</h4>
                    <p className="text-gray-700 mb-4">
                      Dit is dé belangrijkste bron als het gaat om bindweefselherstel in de context van fysiotherapie. 
                      Het boek is gratis online te raadplegen via de HAN bibliotheek en biedt een diepgaand inzicht in 
                      de processen van bindweefselherstel.
                    </p>
                    <span className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-md shadow transition hover:scale-[1.02] duration-300">
                      Gratis toegankelijk via HAN bibliotheek ↗
                    </span>
                  </div>
                </div>
              </a>
            </div>

            {/* Podcast */}
            <div className="bg-purple-50 border-l-4 border-purple-400 rounded-lg shadow-lg p-6">
              <h4 className="text-xl font-semibold text-purple-700 mb-4">Podcast: Bindweefselherstel (AI gegenereerd)</h4>
              <p className="text-gray-700 mb-4">
                Deze podcast biedt een toegankelijke introductie tot de belangrijkste concepten van bindweefselherstel. 
                Ideaal om tijdens het reizen of sporten te beluisteren en je kennis te verdiepen.
              </p>
              <div className="relative w-full h-24 rounded-lg overflow-hidden shadow-lg">
                <iframe 
                  src="https://hannl.sharepoint.com/teams/FruitmandvoorverticaleCoP897/_layouts/15/embed.aspx?UniqueId=ae934ade-19c5-4853-a14d-dcac49996ef8&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create"
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0"
                  scrolling="no"
                  allowFullScreen
                  title="Bindweefselherstel: Fysiologische Processen en Interventies"
                ></iframe>
              </div>
            </div>

            {/* AI Boek */}
            <div className="bg-purple-50 border-l-4 border-purple-400 rounded-lg shadow-lg p-6">
              <h4 className="text-xl font-semibold text-purple-700 mb-4">Online studieboek (AI gegenereerd)</h4>
              <p className="text-gray-700 mb-4">
                Dit digitale studieboek is met behulp van een AI-agent samengesteld. Het biedt een uitgebreide verdieping over bindweefselherstel. Let op: hoewel het boek zorgvuldig is samengesteld, kunnen er fouten of onduidelijkheden in staan. Zie je iets opvallends of twijfel je aan de inhoud? Bespreek dit met medestudenten of docenten en geef het aan ons door. Samen maken we het materiaal steeds beter!
              </p>
              <button
                onClick={() => setShowBoek(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-md shadow transition flex items-center gap-2"
              >
                <span>Bekijk het online boek</span>
                <span className="text-xl">📚</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Aangrenzende Bronnen */}
      <div className="mb-8">
        <ChapterHeader
          title="Aangrenzende Bronnen"
          isOpen={showAangrenzend}
          onToggle={toggleAangrenzend}
          icon="🔍"
        />
        {showAangrenzend && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-purple-50 border-l-4 border-purple-400 rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-semibold text-purple-700 mb-4">De fibroblast</h4>
              <p className="text-gray-700 mb-4">
                Deze video gaat dieper in op de rol van de fibroblast, een cruciale cel in het bindweefselherstel proces.
              </p>
              <div className="aspect-w-16 aspect-h-9">
                <iframe 
                  className="w-full rounded-lg" 
                  src="https://www.youtube.com/embed/N-Vi31TdCII" 
                  title="De fibroblast" 
                  frameBorder="0" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        )}
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
    </div>
  );
}

// Add these styles to your CSS/Tailwind config
/*
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
*/

export default DeBasisSection; 