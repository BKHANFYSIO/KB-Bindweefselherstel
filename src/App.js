import React, { useState, useEffect } from 'react';
import './styles/App.css';
import BreinIcoon from './assets/Brein-icoontje-kennisbooster.png';
import hanSmallLogo from './assets/HAN-logo.png';

// Import section components
import DeBasisSection from './components/DeBasisSection';
import TermenSection from './components/TermenSection';
import McVragenSection from './components/McVragenSection';
import CheckJeKennisSection from './components/CheckJeKennisSection';
import KlinischRedenerenSection from './components/KlinischRedenerenSection';
import EJournalSection from './components/EJournalSection';
import QRCodeComponent from './components/QRCodeComponent';
import Sidebar from './components/Sidebar';
import IntroductieSection from './components/IntroductieSection';

// Verwijder oude data imports
import { generateCertificatePDF } from './utils'; // Import via utils/index.js

function App() {
  const [activeSection, setActiveSection] = useState('introductie');
  const [answers, setAnswers] = useState(() => {
    const savedAnswers = localStorage.getItem('userAnswers');
    return savedAnswers ? JSON.parse(savedAnswers) : {};
  });
  const [flashcardAssessments, setFlashcardAssessments] = useState(() => {
    const savedAssessments = localStorage.getItem('flashcardAssessments');
    return savedAssessments ? JSON.parse(savedAssessments) : {};
  });
  const [uitlegScores, setUitlegScores] = useState(() => {
    const savedScores = localStorage.getItem('uitlegScores');
    return savedScores ? JSON.parse(savedScores) : {};
  });
  const [toepassenScores, setToepassenScores] = useState(() => {
    const savedScores = localStorage.getItem('toepassenScores');
    return savedScores ? JSON.parse(savedScores) : {};
  });
  const [mcScores, setMcScores] = useState(() => {
    const savedScores = localStorage.getItem('mcScores');
    return savedScores ? JSON.parse(savedScores) : {};
  });
  const [firstName, setFirstName] = useState(() => localStorage.getItem('firstName') || '');
  const [lastName, setLastName] = useState(() => localStorage.getItem('lastName') || '');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // States for loaded data
  const [initialFlashcards, setInitialFlashcards] = useState([]);
  const [uitlegQuestions, setUitlegQuestions] = useState([]);
  const [toepassenCases, setToepassenCases] = useState([]);
  const [mcQuestions, setMcQuestions] = useState([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('userAnswers', JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    localStorage.setItem('flashcardAssessments', JSON.stringify(flashcardAssessments));
  }, [flashcardAssessments]);

  useEffect(() => {
    localStorage.setItem('uitlegScores', JSON.stringify(uitlegScores));
  }, [uitlegScores]);

  useEffect(() => {
    localStorage.setItem('toepassenScores', JSON.stringify(toepassenScores));
  }, [toepassenScores]);

  useEffect(() => {
    localStorage.setItem('mcScores', JSON.stringify(mcScores));
  }, [mcScores]);

  useEffect(() => {
    localStorage.setItem('firstName', firstName);
  }, [firstName]);

  useEffect(() => {
    localStorage.setItem('lastName', lastName);
  }, [lastName]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const flashcardsRes = await fetch('/data/flashcards.json');
        const uitlegRes = await fetch('/data/uitleg.json');
        const casusRes = await fetch('/data/casus.json');
        const mcqRes = await fetch('/data/mcq.json');

        if (!flashcardsRes.ok || !uitlegRes.ok || !casusRes.ok || !mcqRes.ok) {
          throw new Error('Een of meerdere databestanden konden niet geladen worden.');
        }

        const flashcardsData = await flashcardsRes.json();
        const uitlegData = await uitlegRes.json();
        const casusData = await casusRes.json();
        const mcqData = await mcqRes.json();

        setInitialFlashcards(flashcardsData);
        setUitlegQuestions(uitlegData);
        setToepassenCases(casusData);
        setMcQuestions(mcqData);

      } catch (err) {
        console.error("Fout bij laden data:", err);
        setError(err.message || 'Fout bij het ophalen van de data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const navigateTo = (section) => { setActiveSection(section); };
  const handleAnswerChange = (questionId, answer) => { setAnswers(prevAnswers => ({ ...prevAnswers, [questionId]: answer })); };
  const handleFlashcardAssessment = (assessments) => { setFlashcardAssessments(assessments); };
  const handleUitlegScoreChange = (newScores) => { setUitlegScores(newScores); };
  const handleToepassenScoreChange = (newScores) => { setToepassenScores(newScores); };
  const handleMcScoreChange = (newScores) => { setMcScores(newScores); };
  const handleFirstNameChange = (event) => { setFirstName(event.target.value); };
  const handleLastNameChange = (event) => { setLastName(event.target.value); };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  // Braindump ophalen uit localStorage
  const getBasisBraindumps = () => {
    const saved = localStorage.getItem('basisBraindumps');
    return saved ? JSON.parse(saved) : [];
  };

  const [flashcardRepeats, setFlashcardRepeats] = useState(() => {
    const saved = localStorage.getItem('flashcardRepeats');
    return saved ? JSON.parse(saved) : {};
  });
  const [mcUserAnswers, setMcUserAnswers] = useState({});
  const [uitlegAnswerVersions, setUitlegAnswerVersions] = useState({});
  const [toepassenAnswerVersions, setToepassenAnswerVersions] = useState({});

  // Persistente opslag van flashcardRepeats
  useEffect(() => {
    localStorage.setItem('flashcardRepeats', JSON.stringify(flashcardRepeats));
  }, [flashcardRepeats]);

  // Handler die het aantal herhalingen direct overschrijft
  const handleRepeatCountsChange = (sessionRepeats) => {
    setFlashcardRepeats(sessionRepeats);
  };

  const handleGeneratePdf = async () => {
    if (loading || error) {
      alert("Data is nog niet geladen of er is een fout opgetreden. PDF kan niet gegenereerd worden.");
      return;
    }
    try {
      await generateCertificatePDF({
        firstName,
        lastName,
        flashcardAssessments,
        initialFlashcards,
        mcScores,
        mcQuestions,
        uitlegScores,
        uitlegQuestions,
        toepassenScores,
        toepassenCases,
        answers,
        basisBraindumps: getBasisBraindumps(),
        flashcardRepeats,
        mcUserAnswers,
        uitlegAnswerVersions,
        toepassenAnswerVersions,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Er is een fout opgetreden bij het genereren van het certificaat. Probeer het later opnieuw.');
    }
  };

  const navItems = [
    { id: 'introductie', label: 'Introductie & Werkwijze', interactive: false },
    { id: 'de_basis', label: 'De Basis', interactive: true },
    { id: 'begrippen_trainer', label: 'Begrippen Trainer', interactive: true },
    { id: 'mc_vragen', label: 'MC Vragen', interactive: true },
    { id: 'check_je_kennis', label: 'Check je Kennis', interactive: true },
    { id: 'klinisch_redeneren', label: 'Klinisch Redeneren', interactive: true },
    { id: 'eJournal', label: 'Certificaat', interactive: false },
  ];

  const getStatus = (sectionId) => {
    if (sectionId === 'de_basis') {
      const braindumps = getBasisBraindumps();
      if (braindumps.length === 0) return 'not';
      return 'completed';
    }
    const item = navItems.find(i => i.id === sectionId);
    if (!item?.interactive) {
      return 'static';
    }
    // Voorkom errors als data nog niet geladen is
    if (loading) return 'not'; 

    switch (sectionId) {
      case 'begrippen_trainer': {
        const completed = Object.keys(flashcardAssessments).length;
        if (initialFlashcards.length === 0 && completed === 0) return 'not'; // Geen data, niet gestart
        if (completed === 0) return 'not';
        if (completed === initialFlashcards.length) return 'completed';
        return 'partial';
      }
      case 'mc_vragen': {
        const completed = Object.keys(mcScores).length;
        if (mcQuestions.length === 0 && completed === 0) return 'not';
        if (completed === 0) return 'not';
        if (completed === mcQuestions.length) return 'completed';
        return 'partial';
      }
      case 'check_je_kennis': {
        const completed = Object.keys(uitlegScores).length;
        if (uitlegQuestions.length === 0 && completed === 0) return 'not';
        if (completed === 0) return 'not';
        if (completed === uitlegQuestions.length) return 'completed';
        return 'partial';
      }
      case 'klinisch_redeneren': {
        const completed = Object.keys(toepassenScores).length;
        if (toepassenCases.length === 0 && completed === 0) return 'not';
        if (completed === 0) return 'not';
        if (completed === toepassenCases.length) return 'completed';
        return 'partial';
      }
      default:
        return 'static';
    }
  };

  const overallProgress = (() => {
    if (loading) return 0;
    const interactiveItems = navItems.filter(i => i.interactive);
    if (interactiveItems.length === 0) return 100;
    const statuses = interactiveItems.map(i => getStatus(i.id));
    const completedCount = statuses.filter(s => s === 'completed').length;
    return (completedCount / interactiveItems.length) * 100;
  })();

  const [resetKey, setResetKey] = useState(0);

  const clearAllData = () => {
    if (window.confirm('Weet je zeker dat je alle opgeslagen voortgang wilt wissen? Dit kan niet ongedaan worden gemaakt.')) {
      localStorage.clear();
      setAnswers({});
      setFlashcardAssessments({});
      setUitlegScores({});
      setToepassenScores({});
      setMcScores({});
      setFirstName('');
      setLastName('');
      setResetKey(prev => prev + 1);
      // Optioneel: navigeer naar de startsectie of refresh de pagina
      // setActiveSection('de_basis'); 
      // window.location.reload(); 
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Laden...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">Fout: {error}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <div className="hidden md:block h-screen sticky top-0">
        <Sidebar
          navItems={navItems}
          activeSection={activeSection}
          navigateTo={navigateTo}
          getStatus={getStatus}
          overallProgress={overallProgress}
          onClearAllData={clearAllData}
        />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={closeSidebar}></div>
          <div className="relative z-50">
            <Sidebar
              navItems={navItems}
              activeSection={activeSection}
              navigateTo={navigateTo}
              getStatus={getStatus}
              overallProgress={overallProgress}
              onClose={closeSidebar}
              isMobile
              onClearAllData={clearAllData}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 min-h-screen">
        <header className="bg-blue-600 text-white p-4 shadow-md flex flex-col md:flex-row md:items-center md:justify-center relative">
          <div className="flex flex-col md:flex-row md:items-center gap-2 min-w-0 w-full justify-center md:justify-center">
            <h1 className="text-2xl font-bold text-center m-0 whitespace-nowrap truncate flex flex-col items-center md:flex-row md:items-center gap-0 md:gap-2">
              <span className="inline-flex items-center">
                {/* Brein-icoon PNG */}
                <img src={BreinIcoon} alt="Brein icoon" className="w-14 h-14 mr-1 object-contain" />
                <span className="text-white font-extrabold tracking-wide drop-shadow-sm">KennisBooster</span>
                <span className="text-gray-100 font-medium ml-1">:</span>
              </span>
              <span className="text-white font-semibold block md:inline text-center">Bindweefselherstel</span>
            </h1>
          </div>
        </header>

        <main className="flex-grow p-6 container mx-auto max-w-4xl">
          <div className="bg-white p-6 rounded-lg shadow">
            {activeSection === 'introductie' && <IntroductieSection />}
            {activeSection === 'de_basis' && <DeBasisSection kennisBoosterTitel="Bindweefselherstel" />}
            {activeSection === 'begrippen_trainer' && initialFlashcards.length > 0 && (
              <TermenSection
                initialFlashcards={initialFlashcards}
                assessments={flashcardAssessments}
                onAssessmentsChange={handleFlashcardAssessment}
                onRepeatCountsChange={handleRepeatCountsChange}
                initialFlashcardRepeats={flashcardRepeats}
                kennisBoosterTitel="Bindweefselherstel"
              />
            )}
            {activeSection === 'mc_vragen' && mcQuestions.length > 0 && (
              <McVragenSection
                questions={mcQuestions}
                scores={mcScores}
                onScoreChange={handleMcScoreChange}
                onUserAnswersChange={setMcUserAnswers}
              />
            )}
            {activeSection === 'check_je_kennis' && uitlegQuestions.length > 0 && (
              <CheckJeKennisSection
                questions={uitlegQuestions}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                scores={uitlegScores}
                onScoreChange={handleUitlegScoreChange}
                resetKey={resetKey}
                onAnswerVersionsChange={setUitlegAnswerVersions}
                kennisBoosterTitel="Bindweefselherstel"
              />
            )}
            {activeSection === 'klinisch_redeneren' && toepassenCases.length > 0 && (
              <KlinischRedenerenSection
                cases={toepassenCases}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                scores={toepassenScores}
                onScoreChange={handleToepassenScoreChange}
                resetKey={resetKey}
                onAnswerVersionsChange={setToepassenAnswerVersions}
                kennisBoosterTitel="Bindweefselherstel"
              />
            )}
            {activeSection === 'eJournal' && (
              <EJournalSection
                onGeneratePDF={handleGeneratePdf}
                firstName={firstName}
                lastName={lastName}
                onFirstNameChange={handleFirstNameChange}
                onLastNameChange={handleLastNameChange}
              />
            )}
            {/* Fallback voor als data voor een actieve sectie nog niet geladen is (of leeg is) */}
            {(activeSection === 'begrippen_trainer' && initialFlashcards.length === 0 && !loading) && <p>Geen begrippen data gevonden.</p>}
            {(activeSection === 'mc_vragen' && mcQuestions.length === 0 && !loading) && <p>Geen MC vragen data gevonden.</p>}
            {(activeSection === 'check_je_kennis' && uitlegQuestions.length === 0 && !loading) && <p>Geen 'check je kennis' data gevonden.</p>}
            {(activeSection === 'klinisch_redeneren' && toepassenCases.length === 0 && !loading) && <p>Geen casus data gevonden.</p>}
          </div>
        </main>

        <footer className="bg-gray-200 text-gray-600 text-center p-3 text-sm flex items-center justify-center gap-2">
          <span>© 2025 HAN opleiding Fysiotherapie</span>
          <img src={hanSmallLogo} alt="HAN logo klein" className="h-7 w-auto ml-2" />
        </footer>
      </div>

      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="md:hidden fixed bottom-6 left-6 bg-purple-700 text-white h-14 w-14 rounded-full flex items-center justify-center shadow-lg z-30 hover:bg-purple-800 transition-colors"
          aria-label="Open menu"
        >
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default App;