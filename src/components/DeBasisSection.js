import React from 'react';

function DeBasisSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-blue-700">De Basis: Wat is Bindweefsel?</h2>
      
      <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
        <p className="text-gray-700 leading-relaxed">
          Welkom bij De Basis! Dit is je startpunt voor het leren over bindweefselherstel. Hier vind je alle fundamentele kennis die je nodig hebt om het onderwerp goed te begrijpen. Of je nu net begint of je kennis wilt opfrissen, dit onderdeel biedt een solide basis met duidelijke uitleg en betrouwbare bronnen. Neem de tijd om de stof goed door te nemen - een stevige basis maakt het leren van complexere onderwerpen later veel makkelijker.
        </p>
      </div>

      <div className="prose max-w-none">
        <h3 className="text-xl font-medium text-gray-800 mt-6">Introductie tot Bindweefsel</h3>
        <p className="text-gray-700 leading-relaxed">
          Bindweefsel is een van de vier fundamentele weefseltypen in het menselijk lichaam, naast spierweefsel, 
          epitheelweefsel en zenuwweefsel. Het is overal in het lichaam aanwezig en vervult cruciale functies 
          in structuur, ondersteuning en verbinding van andere weefsels en organen.
        </p>

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
    </div>
  );
}

export default DeBasisSection; 