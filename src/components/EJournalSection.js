import React, { useState } from 'react';

function EJournalSection({ onGeneratePDF, firstName, lastName, onFirstNameChange, onLastNameChange }) {
  const [showIntro, setShowIntro] = useState(true);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showVRAAK, setShowVRAAK] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPortfolioBlock, setShowPortfolioBlock] = useState(true);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      await onGeneratePDF();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Er is een fout opgetreden bij het genereren van het certificaat. Probeer het later opnieuw.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-blue-700">Certificaat</h2>
      <div className="mb-4">
        <button
          className="text-blue-700 font-semibold mb-2 focus:outline-none flex items-center gap-2"
          onClick={() => setShowIntro((prev) => !prev)}
          aria-expanded={showIntro}
          aria-controls="certificaat-intro"
        >
          {showIntro ? '▼' : '►'} Inleiding
        </button>
        {showIntro && (
          <div id="certificaat-intro" className="bg-blue-50 p-6 rounded-lg shadow-sm space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Dit certificaat is niet alleen een beloning voor je inzet, maar helpt je ook:<br/>
              <ul className="list-disc ml-6 mt-2 mb-2">
                <li>Bij zelfinzicht en het sturen van je eigen leerproces. Je kunt het gebruiken als bewijs voor <b>EVL4 (4.1 sturen van eigen leerproces)</b>, waarmee je mede met hulp van de certificaten kunt aantonen dat je effectieve leerstrategieën toepast en hierin groeit.</li>
                <li>Je kennisniveau te laten zien, wat als basis kan dienen voor <b>diverse EVL's</b>. Gebruik de entry <b>'aanvullend bewijs kennis'</b> in eJournal om dit te onderbouwen.</li>
              </ul>
              <span className="block mt-2">Je hoeft niet alle onderdelen in de voortgang te hebben afgerond. Kies dat wat nu bij je past en maak daar een certificaat van. Later terugkomen en opnieuw een certificaat aanmaken is een goed idee: <b>herhaling is één van de sterkste leerstrategieën!</b></span><br/>
              <span className="font-semibold text-red-600">Let op:</span> Bewaar je certificaten goed! Tip: Je kunt ze direct toevoegen aan je eJournal bij een datapunt en later meer certificaten toevoegen.
            </p>
          </div>
        )}
      </div>

      {/* Inklapbaar kader: Certificaat gebruiken als bewijs in je eJournal/portfolio */}
      <div className="mb-4">
        <button
          className="text-purple-700 font-semibold mb-2 focus:outline-none flex items-center gap-2"
          onClick={() => setShowPortfolioBlock((prev) => !prev)}
          aria-expanded={showPortfolioBlock}
          aria-controls="portfolio-bewijs-blok"
        >
          {showPortfolioBlock ? '▼' : '►'} Certificaat gebruiken als bewijs in je eJournal/portfolio
        </button>
        {showPortfolioBlock && (
          <div id="portfolio-bewijs-blok" className="bg-purple-50 p-6 rounded-lg shadow-sm space-y-4">
            <button
              className="text-purple-700 font-semibold focus:outline-none flex items-center gap-2 mb-2"
              onClick={() => setShowVRAAK((prev) => !prev)}
              aria-expanded={showVRAAK}
              aria-controls="vraak-kader"
            >
              {showVRAAK ? '▼' : '►'} Bekijk de VRAAK criteria
            </button>
            {showVRAAK && (
              <div id="vraak-kader" className="bg-white border-l-4 border-purple-400 p-4 mb-4 rounded shadow-sm">
                <p className="font-semibold mb-2">Een portfolio moet bij de eindwaardering voldoen aan onderstaande VRAAK criteria:</p>
                <ol className="list-decimal ml-6 space-y-2 text-gray-700">
                  <li><b>Variatie:</b> Bewijs uit verschillende contexten (schriftelijk, presentaties, video, live, kennisbewijzen, feedback van verschillende perspectieven, groeps- en individuele producten).</li>
                  <li><b>Relevantie:</b> Bewijs moet de belangrijkste leeruitkomsten dekken en aantonen.</li>
                  <li><b>Authenticiteit:</b> Bewijs moet echt van jou zijn. Sluit plagiaat uit en let op evenredige bijdrage bij groepswerk.</li>
                  <li><b>Actualiteitswaarde:</b> Bewijs moet recent zijn en passen bij het thema.</li>
                  <li><b>Kwantiteit:</b> Voldoende bewijs, goed verdeeld over de leeruitkomsten.</li>
                </ol>
              </div>
            )}
            <p className="text-gray-700 leading-relaxed">
              Denk goed na over <b>hoe</b> je het certificaat inzet als bewijs. Beschrijf bij het toevoegen in je eJournal waarom dit certificaat relevant is voor jouw leerdoelen en welke groei je laat zien. Combineer het certificaat met andere bewijzen voor een sterker portfolio.
            </p>
            <h4 className="text-md font-semibold text-yellow-800 mt-4 mb-2">Verdieping: Nut en authenticiteit van het certificaat</h4>
            <p className="text-gray-700 leading-relaxed mb-2">
              Het certificaat is waardevol als bewijs van je kennis, inzet en groei. Binnen de VRAAK-criteria zegt het echter weinig over <b>authenticiteit</b>: vrijwel alle schriftelijke producten die niet live onder toezicht zijn gemaakt, zijn niet afdoende om authenticiteit te waarborgen. Dat maakt ze niet minder bruikbaar! Combineer je certificaat bijvoorbeeld met een live presentatie, een mondelinge toelichting of feedback van een docent om de authenticiteit te versterken. Bekijk onderstaand de voorbeelden van aanvullend bewijs<br/><br/>
              Certificaten zijn juist heel geschikt om variatie te tonen en relevantie aan te tonen voor verschillende leerdoelen. Je kunt met certificaten en AI laten zien dat je groeit en je voortgang in de tijd zichtbaar maken. Bovendien toon je aan dat je vaardig bent met AI-tools.
            </p>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Gebruik certificaten als aanvullend bewijs, niet als enige bewijsstuk.</li>
              <li>Laat groei zien door meerdere certificaten over tijd te verzamelen.</li>
              <li>Combineer met andere vormen van bewijs voor maximale impact.</li>
            </ul>
            {/* Voorbeelden grid */}
            <div className="mt-6">
              <h5 className="font-semibold text-purple-800 mb-4">Voorbeelden van aanvullend bewijs</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Performance assessment */}
                <div className="bg-white rounded-lg shadow p-4 flex flex-col">
                  <span className="font-bold text-blue-700 mb-2">Performance assessment</span>
                  <p className="text-gray-700 text-sm mb-2">Live demonstratie van kennis en vaardigheden in een echte of gesimuleerde beroepscontext.</p>
                  <ul className="text-xs text-gray-600 mb-1">
                    <li><b>Voordelen:</b> Zeer hoge authenticiteit, direct observeerbaar, veel relevantie.</li>
                    <li><b>Nadelen:</b> Variatie vaak beperkt (meestal één onderwerp, soms minder nadruk op kennis), organisatie-intensief, soms lastig vast te leggen voor later bewijs, en 'duur' bij feedback van een docent (beperkte uren beschikbaar).</li>
                  </ul>
                  <span className="text-green-700 text-xs font-semibold">Authenticiteit uitstekend gewaarborgd</span>
                  <span className="text-purple-700 text-xs mt-1">Tip: Vergroot variatie door meerdere thema's te behandelen of de casus door de afnemer te laten bepalen.</span>
                </div>
                {/* AI-chatbot opname */}
                <div className="bg-white rounded-lg shadow p-4 flex flex-col">
                  <span className="font-bold text-blue-700 mb-2">Opname AI-chatbotgesprek</span>
                  <p className="text-gray-700 text-sm mb-2">Student wordt door een AI-chatbot overhoord over meerdere onderwerpen van verschillende certificaten.</p>
                  <ul className="text-xs text-gray-600 mb-1">
                    <li><b>Voordelen:</b> Veel variatie en relevantie, makkelijk te bewaren en te delen, retentietest mogelijk. <b>Als het een video-opname is waarbij student en prompt zichtbaar zijn, is de authenticiteit goed te waarborgen.</b></li>
                    <li><b>Nadelen:</b> Authenticiteit afhankelijk van wie het gesprek voert, combineer met reflectie of feedback.</li>
                  </ul>
                  <span className="text-yellow-700 text-xs font-semibold">Authenticiteit te versterken met extra bewijs</span>
                </div>
                {/* Live presentatie */}
                <div className="bg-white rounded-lg shadow p-4 flex flex-col">
                  <span className="font-bold text-blue-700 mb-2">Live presentatie & feedback</span>
                  <p className="text-gray-700 text-sm mb-2">Presentatie aan medestudenten en/of docent, met verdiepende vragen en feedback.</p>
                  <ul className="text-xs text-gray-600 mb-1">
                    <li><b>Voordelen:</b> Goede authenticiteit, veel variatie, directe feedback mogelijk.</li>
                    <li><b>Nadelen:</b> Minder geschikt voor alle typen kennis, afhankelijk van aanwezigen.</li>
                  </ul>
                  <span className="text-green-700 text-xs font-semibold">Authenticiteit goed te waarborgen</span>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <span className="font-semibold text-blue-800">Tip:</span> Wil je meer leren over het maken van een goed portfolio? Volg dan de e-learning over het maken van een goed portfolio (verwachte komst: start studiejaar 2025-2026, te vinden op de FysioAI LeerToolbox).
              </div>
            </div>
          </div>
        )}
      </div>

    <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-blue-700">Certificaat genereren</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Genereer een PDF-certificaat met je antwoorden en zelfbeoordelingen.
              .
            </p>
          </div>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="firstName">
                Voornaam
              </label>
              <input
                type="text"
                id="firstName"
                className="w-full p-2 border rounded-md"
                value={firstName}
                onChange={onFirstNameChange}
                placeholder="Vul je voornaam in"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="lastName">
                Achternaam
              </label>
              <input
                type="text"
                id="lastName"
                className="w-full p-2 border rounded-md"
                value={lastName}
                onChange={onLastNameChange}
                placeholder="Vul je achternaam in"
              />
            </div>
          </div>
          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className={`w-full bg-blue-600 text-white py-3 px-6 rounded-md transition-colors ${
              isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {isGenerating ? 'Certificaat wordt gegenereerd...' : 'Certificaat genereren'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EJournalSection; 