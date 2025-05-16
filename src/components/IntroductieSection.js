import React from 'react';
import QRCodeComponent from './QRCodeComponent';
// import hanLongLogo from '../assets/han-hogeschool-van-arnhem-en-nijmegen-logo.png';

function IntroductieSection() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-blue-700">Introductie & Werkwijze</h1>
        <div className="ml-4">
          <QRCodeComponent size={48} />
        </div>
      </div>

      {/* Banner highlighting the unique focus */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <span className="text-4xl">🎯</span>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Niet alleen WAT, maar vooral HOE je leert!</h2>
            <p className="text-lg opacity-90">
              Deze KennisBooster is uniek: we focussen niet alleen op de informatie zelf, maar vooral op HOE je deze kennis effectief in je langetermijngeheugen opslaat. Met bewezen leermethodes help je je brein om informatie écht te onthouden.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4 rounded">
        <span className="font-semibold text-yellow-800 block mb-1">Let op: jouw voortgang wordt lokaal opgeslagen</span>
        <span className="text-yellow-900 text-sm block">
          Alle antwoorden, beoordelingen en voortgang in deze KennisBooster worden <b>uitsluitend lokaal</b> in je browser opgeslagen (op je eigen computer). Je gegevens zijn niet zichtbaar voor anderen en worden niet online bewaard. Je kunt je voortgang wissen met de knop <b>"wis alle voortgang"</b> in het menu. Let op: als je je browsergegevens wist, een andere computer gebruikt of je apparaat opnieuw instelt, kan je voortgang verloren gaan.
        </span>
      </div>
      <div className="bg-blue-50 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Welkom bij de KennisBooster Bindweefselherstel!</h2>
        <p className="text-gray-700 mb-2">
          Deze KennisBooster is ontwikkeld in co-creatie met AI door Bastiaan Koekoek, docent fysiotherapie aan de HAN in Nijmegen.
        </p>
        <p className="text-gray-700 mb-2">
          Deze site is ontwikkeld voor studenten fysiotherapie van de HAN. Je vindt hier interactieve onderdelen die gebaseerd zijn op <b>evidence-based leerstrategieën</b> zoals actief ophalen, gespreid herhalen, zelftoetsing, en feedback. Bij elk onderdeel wordt uitgelegd waarom deze aanpak werkt en hoe je het meeste uit je studie haalt.
        </p>
        <ul className="list-disc pl-6 text-gray-700 mb-2">
          <li><b>Actief leren:</b> Door zelf te formuleren, oefenen en reflecteren leer je dieper en onthoud je langer.</li>
          <li><b>Herhalen:</b> Regelmatig terugkomen en oefenen is bewezen effectief voor duurzame kennisopbouw.</li>
          <li><b>Zelftoetsing:</b> Test jezelf met MC-vragen, begrippen en casussen. Je ziet direct waar je staat.</li>
          <li><b>Feedback:</b> Krijg feedback van AI, medestudenten of reflecteer zelf. Dit helpt je gericht verbeteren.</li>
        </ul>
        <p className="text-gray-700 mb-2">
          Je kunt een <b>certificaat</b> genereren als bewijs van je inzet. Je hoeft niet alle onderdelen volledig af te ronden om een certificaat te krijgen. Gebruik het certificaat bijvoorbeeld in je <b>portfolio of eJournal</b> als bewijs van actieve studie en reflectie.
        </p>
        <p className="text-gray-700 mb-2">
          <b>Let op:</b> Je bepaalt zelf je leerroute. Je hoeft niet alles in één keer te doen. Juist vaker terugkomen en herhalen is een krachtige leerstrategie!
        </p>
        <p className="text-gray-600 text-sm mt-4">
          Meer uitleg over het certificaat en het gebruik in je portfolio vind je in het laatste hoofdstuk.
        </p>
        <p className="text-gray-700 mt-4">
          In de <b>FysioAI LeerTools</b> vind je andere AI-tools waarmee je diepgaand kunt leren over effectieve leerstrategieën.
        </p>
      </div>
    </div>
  );
}

export default IntroductieSection; 