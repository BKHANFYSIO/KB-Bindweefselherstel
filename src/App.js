import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import './styles/App.css';

// Import section components
import DeBasisSection from './components/DeBasisSection';
import TermenSection from './components/TermenSection';
import McVragenSection from './components/McVragenSection';
import CheckJeKennisSection from './components/CheckJeKennisSection';
import KlinischRedenerenSection from './components/KlinischRedenerenSection';
import EJournalSection from './components/EJournalSection';

// --- Data ---
const initialFlashcards = [
  { id: "term1", term: "Fibroblast", definition: "De belangrijkste cel in bindweefsel, verantwoordelijk voor de productie van de extracellulaire matrix componenten zoals collageen." },
  { id: "term2", term: "Collageen", definition: "Een structureel eiwit dat zorgt voor treksterkte en stevigheid in bindweefsel. Er bestaan verschillende types met specifieke functies." },
  { id: "term3", term: "Extracellulaire Matrix (ECM)", definition: "Het netwerk van eiwitten (zoals collageen, elastine) en andere moleculen buiten de cellen dat structurele en biochemische ondersteuning biedt aan de omliggende cellen." },
  { id: "term4", term: "Grondsubstantie", definition: "Een gel-achtige substantie in de ECM, rijk aan water, proteoglycanen en glycoproteïnen, die compressie weerstaat en transport van voedingsstoffen faciliteert." },
  { id: "term5", term: "Wondgenezing Fasen", definition: "Het proces van weefselherstel na letsel, typisch onderverdeeld in ontsteking, proliferatie, en remodellering." }
];

const uitlegQuestions = [
  {
    id: "uitleg_vraag_collega_1", 
    type: "colleague", 
    questionText: "Beschrijf aan een collega-fysiotherapeut het fysiologische proces van de proliferatiefase tijdens bindweefselherstel na een spierscheuring.",
    criteria: [
      "Benoem de belangrijkste cellen en hun rol (bv. fibroblasten, endotheelcellen).",
      "Beschrijf de vorming van granulatieweefsel en angiogenese.",
      "Noem het type collageen dat initieel wordt afgezet.",
      "Gebruik correcte fysiologische vaktermen."
    ],
    modelAnswer: "Tijdens de proliferatiefase (dag 3-21 ong.) migreren fibroblasten naar het wondgebied en starten de synthese van ECM, voornamelijk type III collageen, wat zorgt voor initiële matrixstructuur. Parallel vindt angiogenese plaats door endotheelcelproliferatie, resulterend in de vorming van capillairen en rood granulatieweefsel. Myofibroblasten dragen bij aan wondcontractie door hun contractiele eigenschappen."
  },
  {
    id: "uitleg_vraag_client_1", 
    type: "client", 
    questionText: "Leg aan een cliënt met een recente enkelbandblessure (verstuiking) uit waarom het belangrijk is om de eerste dagen rust te houden en daarna voorzichtig te gaan bewegen.",
    criteria: [
      "Gebruik eenvoudige, begrijpelijke taal (vermijd te veel jargon).",
      "Leg het concept 'ontsteking' kort en simpel uit (bv. 'opruimreactie', 'natuurlijke reactie').",
      "Verklaar het belang van relatieve rust voor de eerste fase (bescherming, herstelproces starten).",
      "Verklaar waarom vroege, gedoseerde beweging daarna gunstig is (bv. 'weefsel sterker maken', 'juiste richting geven').",
      "Gebruik eventueel een eenvoudige analogie (bv. 'bouwstenen leggen')."
    ],
    modelAnswer: "Na het verstuiken van je enkel reageert je lichaam met een natuurlijke 'opruimreactie', dat noemen we ontsteking. Dit is nodig voor herstel. De eerste paar dagen is het slim om je enkel wat rust te geven, zodat deze reactie goed kan verlopen en je de enkel beschermt. Zie het als de fundering leggen voor een nieuw muurtje. Daarna is het juist goed om voorzichtig te gaan bewegen op geleide van de pijn. Vergelijk het met de 'bouwstenen' (het nieuwe weefsel) in de juiste richting leggen en langzaam sterker maken. Door gedoseerd te bewegen, help je je enkel om weer sterk en stabiel te worden."
  }
];

const toepassenCases = [
  {
    id: "toepassen_casus_1",
    caseText: "Een patiënt heeft een enkelverstuiking (graad 2 inversietrauma) opgelopen. Welke bindweefselstructuren zijn waarschijnlijk beschadigd en welke cellen spelen een hoofdrol in het vroege herstel?",
    criteria: [
      "Identificeer specifieke ligamenten die vaak betrokken zijn bij een inversietrauma (bv. Lig. Talofibulare Anterius).",
      "Noem de primaire cel(len) actief in de ontstekings- en vroege proliferatiefase (bv. neutrofielen, macrofagen, fibroblasten).",
      "Beschrijf kort de functie van deze cel(len) in dit stadium (bv. opruimen, matrix productie starten)."
    ],
    modelAnswer: "Bij een graad 2 inversietrauma is er vaak sprake van een (partiële) ruptuur van het Lig. Talofibulare Anterius (LTA) en mogelijk het Lig. Calcaneofibulare (LCF). In de vroege fase (ontsteking/proliferatie) zijn neutrofielen en macrofagen actief voor het opruimen van debris (fagocytose). Fibroblasten worden geactiveerd en migreren naar het gebied om te starten met de productie van een nieuwe, ongeorganiseerde ECM, voornamelijk type III collageen."
  }
];

const mcQuestions = [
  {
    id: "mc_vraag_1",
    questionText: "Welk type collageen is dominant aanwezig in de vroege proliferatiefase van wondgenezing en zorgt voor de initiële matrix?",
    options: ["Type I Collageen", "Type II Collageen", "Type III Collageen", "Type IV Collageen"],
    correctOptionIndex: 2,
    feedback: "Type III collageen wordt vroeg in de wondgenezing afgezet door fibroblasten en vormt een initiële, flexibele matrix die later grotendeels wordt vervangen door het sterkere Type I collageen."
  },
  {
    id: "mc_vraag_2",
    questionText: "Welke cel is primair verantwoordelijk voor fagocytose (opruimen van celresten en bacteriën) tijdens de ontstekingsfase?",
    options: ["Fibroblast", "Macrofagen", "Endotheelcel", "Mastcel"],
    correctOptionIndex: 1,
    feedback: "Macrofagen zijn cruciale fagocyten in de ontstekingsfase; ze ruimen dode cellen, bacteriën en beschadigd weefsel op en scheiden groeifactoren uit die het herstelproces stimuleren."
  },
  {
    id: "mc_vraag_3",
    questionText: "Angiogenese, de vorming van nieuwe bloedvaten, is een kenmerk van welke fase van wondgenezing?",
    options: ["Hemostase", "Ontstekingsfase", "Proliferatiefase", "Remodelleringsfase"],
    correctOptionIndex: 2,
    feedback: "Angiogenese is essentieel tijdens de proliferatiefase om het nieuw gevormde granulatieweefsel te voorzien van zuurstof en voedingsstoffen, nodig voor celactiviteit en matrixsynthese."
  }
];

// --- Utility Functions ---
function shuffleArray(array) {
  let currentIndex = array.length, randomIndex;
  const arrayCopy = [...array];
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [arrayCopy[currentIndex], arrayCopy[randomIndex]] = [
      arrayCopy[randomIndex], arrayCopy[currentIndex]];
  }
  return arrayCopy;
}

// --- Main App Component ---
function App() {
  const [activeSection, setActiveSection] = useState('de_basis');
  const [answers, setAnswers] = useState({});
  const [flashcardAssessments, setFlashcardAssessments] = useState({});
  const [uitlegScores, setUitlegScores] = useState({});
  const [toepassenScores, setToepassenScores] = useState({});
  const [mcScores, setMcScores] = useState({});
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const navigateTo = (section) => { setActiveSection(section); };
  const handleAnswerChange = (questionId, answer) => { setAnswers(prevAnswers => ({ ...prevAnswers, [questionId]: answer })); };
  const handleFlashcardAssessment = (assessments) => { setFlashcardAssessments(assessments); };
  const handleUitlegScoreChange = (newScores) => { setUitlegScores(newScores); };
  const handleToepassenScoreChange = (newScores) => { setToepassenScores(newScores); };
  const handleMcScoreChange = (newScores) => { setMcScores(newScores); };
  const handleFirstNameChange = (event) => { setFirstName(event.target.value); };
  const handleLastNameChange = (event) => { setLastName(event.target.value); };

  // --- PDF Generation Logic ---
  const generatePDF = () => {
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - 2 * margin;
    let currentY = margin;
    const lineHeight = 12;
    const bottomMargin = 50;

    // Helper function for adding wrapped text
    const addWrappedText = (text, x, y, maxWidth, lineHeight) => {
      const lines = pdf.splitTextToSize(text, maxWidth);
      let newY = y;
      lines.forEach(line => {
        if (newY > pageHeight - bottomMargin) {
          pdf.addPage();
          newY = margin;
        }
        pdf.text(line, x, newY);
        newY += lineHeight;
      });
      return newY;
    };

    // Helper function for colored rectangles
    const addColoredRect = (y, height, color) => {
      pdf.setFillColor(...color);
      pdf.rect(margin, y, contentWidth, height, 'F');
    };

    // Helper function for score color
    const getScoreColor = (score) => {
      switch(score) {
        case 'expert': return [76, 175, 80]; // green
        case 'gevorderd': return [255, 193, 7]; // yellow
        case 'beginner': return [244, 67, 54]; // red
        case 'correct': return [76, 175, 80]; // green
        case 'incorrect': return [244, 67, 54]; // red
        default: return [158, 158, 158]; // grey
      }
    };

    // Page 1: Certificate and Summary
    pdf.setFillColor(37, 99, 235); // blue-600
    pdf.rect(0, 0, pageWidth, 120, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont(undefined, 'bold');
    const titleText = "eJournal - Bindweefselherstel Leren";
    const titleWidth = pdf.getTextWidth(titleText);
    pdf.text(titleText, (pageWidth - titleWidth) / 2, 60);

    pdf.setFontSize(16);
    const fullName = `${firstName || '[Voornaam]'} ${lastName || '[Achternaam]'}`;
    const nameWidth = pdf.getTextWidth(fullName);
    pdf.text(fullName, (pageWidth - nameWidth) / 2, 90);

    currentY = 140;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.text("Overzicht Voortgang", margin, currentY);
    currentY += 30;

    // Summary statistics
    const stats = {
      flashcards: {
        total: initialFlashcards.length,
        completed: Object.keys(flashcardAssessments).length,
        scores: {
          Goed: initialFlashcards.filter(c => flashcardAssessments[c.id] === 'Goed').length,
          Redelijk: initialFlashcards.filter(c => flashcardAssessments[c.id] === 'Redelijk').length,
          Nee: initialFlashcards.filter(c => flashcardAssessments[c.id] === 'Nee').length
        }
      },
      mcQuestions: {
        total: mcQuestions.length,
        completed: Object.keys(mcScores).length,
        correct: Object.values(mcScores).filter(score => score === 'correct').length
      },
      uitlegVragen: {
        total: uitlegQuestions.length,
        completed: Object.keys(uitlegScores).length,
        scores: {
          expert: uitlegQuestions.filter(q => uitlegScores[q.id] === 'expert').length,
          gevorderd: uitlegQuestions.filter(q => uitlegScores[q.id] === 'gevorderd').length,
          beginner: uitlegQuestions.filter(q => uitlegScores[q.id] === 'beginner').length
        }
      },
      klinischRedeneren: {
        total: toepassenCases.length,
        completed: Object.keys(toepassenScores).length,
        scores: {
          expert: toepassenCases.filter(c => toepassenScores[c.id] === 'expert').length,
          gevorderd: toepassenCases.filter(c => toepassenScores[c.id] === 'gevorderd').length,
          beginner: toepassenCases.filter(c => toepassenScores[c.id] === 'beginner').length
        }
      }
    };

    // Draw progress bars
    const drawProgressBar = (label, completed, total, y, details = null) => {
      pdf.setFontSize(12);
      pdf.text(label, margin, y);
      
      // Background bar
      pdf.setFillColor(229, 231, 235); // gray-200
      pdf.rect(margin + 200, y - 8, 200, 12, 'F');
      
      // Progress bar
      if (completed > 0) {
        pdf.setFillColor(37, 99, 235); // blue-600
        pdf.rect(margin + 200, y - 8, (completed / total) * 200, 12, 'F');
      }
      
      // Progress text
      pdf.text(`${completed}/${total}`, margin + 420, y);

      // Details if provided
      if (details) {
        Object.entries(details).forEach(([key, value], index) => {
          const x = margin + 200 + (index * 80);
          pdf.setFillColor(...getScoreColor(key.toLowerCase()));
          pdf.circle(x, y + 15, 4, 'F');
          pdf.text(`${key}: ${value}`, x + 10, y + 15);
        });
        return 35;
      }
      return 25;
    };

    currentY += drawProgressBar("Begrippen Trainer", stats.flashcards.completed, stats.flashcards.total, currentY, stats.flashcards.scores);
    currentY += drawProgressBar("Multiple Choice", stats.mcQuestions.completed, stats.mcQuestions.total, currentY, { Correct: stats.mcQuestions.correct });
    currentY += drawProgressBar("Check je Kennis", stats.uitlegVragen.completed, stats.uitlegVragen.total, currentY, stats.uitlegVragen.scores);
    currentY += drawProgressBar("Klinisch Redeneren", stats.klinischRedeneren.completed, stats.klinischRedeneren.total, currentY, stats.klinischRedeneren.scores);

    // Date and signature
    currentY = pageHeight - 120;
    pdf.text("Datum van generatie:", margin, currentY);
    pdf.text(new Date().toLocaleDateString('nl-NL'), margin + 150, currentY);
    
    // Appendices
    if (Object.keys(flashcardAssessments).length > 0) {
      pdf.addPage();
      currentY = margin;
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text("Bijlage: Begrippen Trainer Beoordelingen", margin, currentY);
      currentY += 30;
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');

      initialFlashcards.forEach(card => {
        const assessment = flashcardAssessments[card.id] || 'Niet beoordeeld';
        if (currentY > pageHeight - bottomMargin) {
          pdf.addPage();
          currentY = margin;
        }
        
        // Background for each entry
        pdf.setFillColor(249, 250, 251); // gray-50
        pdf.rect(margin - 5, currentY - 15, contentWidth + 10, 25, 'F');
        
        // Term
        pdf.setFont(undefined, 'bold');
        pdf.text(card.term, margin, currentY);
        
        // Assessment with color
        pdf.setFont(undefined, 'normal');
        const scoreColor = assessment === 'Goed' ? [76, 175, 80] : 
                         assessment === 'Redelijk' ? [255, 193, 7] : 
                         assessment === 'Nee' ? [244, 67, 54] : 
                         [158, 158, 158];
        pdf.setTextColor(...scoreColor);
        pdf.text(assessment, margin + 300, currentY);
        pdf.setTextColor(0, 0, 0);
        
        currentY += 30;
      });
    }

    // MC Questions Results
    if (Object.keys(mcScores).length > 0) {
      pdf.addPage();
      currentY = margin;
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text("Bijlage: Multiple Choice Resultaten", margin, currentY);
      currentY += 30;
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');

      mcQuestions.forEach((q, index) => {
        if (currentY > pageHeight - 100) {
          pdf.addPage();
          currentY = margin;
        }

        const score = mcScores[q.id];
        
        // Question background
        pdf.setFillColor(249, 250, 251);
        pdf.rect(margin - 5, currentY - 15, contentWidth + 10, 80, 'F');
        
        // Question number and text
        pdf.setFont(undefined, 'bold');
        currentY = addWrappedText(`Vraag ${index + 1}:`, margin, currentY, contentWidth, lineHeight);
        pdf.setFont(undefined, 'normal');
        currentY = addWrappedText(q.questionText, margin + 10, currentY + 5, contentWidth - 10, lineHeight);
        
        // Result with color
        const resultColor = score === 'correct' ? [76, 175, 80] : 
                          score === 'incorrect' ? [244, 67, 54] : 
                          [158, 158, 158];
        pdf.setTextColor(...resultColor);
        pdf.text(`Resultaat: ${score === 'correct' ? 'Correct' : score === 'incorrect' ? 'Incorrect' : 'Niet beantwoord'}`,
                margin + 10, currentY + 15);
        pdf.setTextColor(0, 0, 0);
        
        currentY += 40;
      });
    }

    // Check je Kennis Results
    if (Object.keys(uitlegScores).length > 0 || uitlegQuestions.some(q => answers[q.id])) {
      pdf.addPage();
      currentY = margin;
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text("Bijlage: Check je Kennis Resultaten", margin, currentY);
      currentY += 30;
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');

      uitlegQuestions.forEach((q, index) => {
        if (currentY > pageHeight - 100) {
          pdf.addPage();
          currentY = margin;
        }

        const answer = answers[q.id] || '[Niet beantwoord]';
        const score = uitlegScores[q.id] || 'Niet beoordeeld';
        
        // Question background
        pdf.setFillColor(249, 250, 251);
        pdf.rect(margin - 5, currentY - 15, contentWidth + 10, 120, 'F');
        
        // Question header
        pdf.setFont(undefined, 'bold');
        currentY = addWrappedText(`Vraag ${index + 1} (${q.type === 'client' ? 'Cliënt' : 'Collega'}):`, margin, currentY, contentWidth, lineHeight);
        
        // Question text and answer
        pdf.setFont(undefined, 'normal');
        currentY = addWrappedText(q.questionText, margin + 10, currentY + 5, contentWidth - 10, lineHeight);
        currentY = addWrappedText(`Antwoord: ${answer}`, margin + 10, currentY + 5, contentWidth - 10, lineHeight);
        
        // Score with color
        const scoreColor = score === 'expert' ? [76, 175, 80] : 
                         score === 'gevorderd' ? [255, 193, 7] : 
                         score === 'beginner' ? [244, 67, 54] : 
                         [158, 158, 158];
        pdf.setTextColor(...scoreColor);
        pdf.text(`Niveau: ${score}`, margin + 10, currentY + 15);
        pdf.setTextColor(0, 0, 0);
        
        currentY += 40;
      });
    }

    // Klinisch Redeneren Results
    if (Object.keys(toepassenScores).length > 0 || toepassenCases.some(c => answers[c.id])) {
      pdf.addPage();
      currentY = margin;
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text("Bijlage: Klinisch Redeneren Resultaten", margin, currentY);
      currentY += 30;
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');

      toepassenCases.forEach((c, index) => {
        if (currentY > pageHeight - 100) {
          pdf.addPage();
          currentY = margin;
        }

        const answer = answers[c.id] || '[Niet beantwoord]';
        const score = toepassenScores[c.id] || 'Niet beoordeeld';
        
        // Case background
        pdf.setFillColor(249, 250, 251);
        pdf.rect(margin - 5, currentY - 15, contentWidth + 10, 120, 'F');
        
        // Case header and text
        pdf.setFont(undefined, 'bold');
        currentY = addWrappedText(`Casus ${index + 1}:`, margin, currentY, contentWidth, lineHeight);
        pdf.setFont(undefined, 'normal');
        currentY = addWrappedText(c.caseText, margin + 10, currentY + 5, contentWidth - 10, lineHeight);
        currentY = addWrappedText(`Analyse: ${answer}`, margin + 10, currentY + 5, contentWidth - 10, lineHeight);
        
        // Score with color
        const scoreColor = score === 'expert' ? [76, 175, 80] : 
                         score === 'gevorderd' ? [255, 193, 7] : 
                         score === 'beginner' ? [244, 67, 54] : 
                         [158, 158, 158];
        pdf.setTextColor(...scoreColor);
        pdf.text(`Niveau: ${score}`, margin + 10, currentY + 15);
        pdf.setTextColor(0, 0, 0);
        
        currentY += 40;
      });
    }

    pdf.save('eJournal_Bindweefselherstel.pdf');
  };

  // Navigation items
  const navItems = [
    { id: 'de_basis', label: 'De Basis' },
    { id: 'begrippen_trainer', label: 'Begrippen Trainer' },
    { id: 'mc_vragen', label: 'MC Vragen' },
    { id: 'check_je_kennis', label: 'Check je Kennis' },
    { id: 'klinisch_redeneren', label: 'Klinisch Redeneren' },
    { id: 'eJournal', label: 'eJournal' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">Bindweefselherstel Leren</h1>
      </header>
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <ul className="flex justify-center space-x-4 p-3">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => navigateTo(item.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out ${
                  activeSection === item.id
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <main className="flex-grow p-6 container mx-auto max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow">
          {activeSection === 'de_basis' && <DeBasisSection />}
          {activeSection === 'begrippen_trainer' && (
            <TermenSection
              initialFlashcards={initialFlashcards}
              assessments={flashcardAssessments}
              onAssessmentsChange={handleFlashcardAssessment}
            />
          )}
          {activeSection === 'mc_vragen' && (
            <McVragenSection
              questions={mcQuestions}
              scores={mcScores}
              onScoreChange={handleMcScoreChange}
            />
          )}
          {activeSection === 'check_je_kennis' && (
            <CheckJeKennisSection
              questions={uitlegQuestions}
              answers={answers}
              onAnswerChange={handleAnswerChange}
              scores={uitlegScores}
              onScoreChange={handleUitlegScoreChange}
            />
          )}
          {activeSection === 'klinisch_redeneren' && (
            <KlinischRedenerenSection
              cases={toepassenCases}
              answers={answers}
              onAnswerChange={handleAnswerChange}
              scores={toepassenScores}
              onScoreChange={handleToepassenScoreChange}
            />
          )}
          {activeSection === 'eJournal' && (
            <EJournalSection
              onGeneratePDF={generatePDF}
              firstName={firstName}
              lastName={lastName}
              onFirstNameChange={handleFirstNameChange}
              onLastNameChange={handleLastNameChange}
            />
          )}
        </div>
      </main>
      <footer className="bg-gray-200 text-gray-600 text-center p-3 text-sm">
        © 2025 Fysio Leerplatform
      </footer>
    </div>
  );
}

export default App;