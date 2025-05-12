import { jsPDF } from 'jspdf';

// Helper function for score color (blijft intern aan deze module)
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

// Helper function for adding wrapped text (blijft intern aan deze module)
const addWrappedText = (pdf, text, x, y, maxWidth, lineHeight, pageHeight, margin, bottomMargin) => {
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

// Helper function for drawing progress bars (blijft intern aan deze module)
const drawProgressBar = (pdf, label, completed, total, y, details, margin, getScoreColorFunc) => {
  pdf.setFontSize(12);
  pdf.text(label, margin, y);
  
  pdf.setFillColor(229, 231, 235); // gray-200
  pdf.rect(margin + 200, y - 8, 200, 12, 'F');
  
  if (completed > 0) {
    pdf.setFillColor(37, 99, 235); // blue-600
    pdf.rect(margin + 200, y - 8, (completed / total) * 200, 12, 'F');
  }
  
pdf.text(`${completed}/${total}`, margin + 420, y);

  if (details) {
    Object.entries(details).forEach(([key, value], index) => {
      const x = margin + 200 + (index * 80);
      pdf.setFillColor(...getScoreColorFunc(key.toLowerCase()));
      pdf.circle(x, y + 15, 4, 'F');
      pdf.text(`${key}: ${value}`, x + 10, y + 15);
    });
    return 35; // increased height due to details
  }
  return 25; // standard height
};

export const generateCertificatePDF = (data) => {
  const {
    firstName,
    lastName,
    flashcardAssessments,
    initialFlashcards, // Nodig voor totalen en termen
    mcScores,
    mcQuestions, // Nodig voor totalen en vraagteksten
    uitlegScores,
    uitlegQuestions, // Nodig voor totalen en vraagteksten
    toepassenScores,
    toepassenCases, // Nodig voor totalen en casusteksten
    answers, // Nodig voor de antwoorden in Check je Kennis en Klinisch Redeneren
    basisBraindumps = [], // NIEUW
  } = data;

  const pdf = new jsPDF('p', 'pt', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - 2 * margin;
  let currentY = margin;
  const lineHeight = 12;
  const bottomMargin = 50;

  // --- Mooie Certificaatpagina ---
  pdf.setFillColor(37, 99, 235); // blauw
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(40);
  pdf.setFont(undefined, 'bold');
  pdf.text('CERTIFICAAT', pageWidth / 2, 120, { align: 'center' });
  pdf.setFontSize(22);
  pdf.text('Bindweefselherstel Leren', pageWidth / 2, 170, { align: 'center' });
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'normal');
  pdf.text('Hierbij wordt verklaard dat', pageWidth / 2, 230, { align: 'center' });
  pdf.setFont(undefined, 'bold');
  pdf.setFontSize(24);
  const fullName = `${firstName || '[Voornaam]'} ${lastName || '[Achternaam]'}`;
  pdf.text(fullName, pageWidth / 2, 270, { align: 'center' });
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(16);
  pdf.text('de interactieve leermodule over bindweefselherstel heeft doorlopen en actief heeft gewerkt aan kennis, begrip en reflectie.', pageWidth / 2, 310, { align: 'center', maxWidth: contentWidth });
  pdf.setFontSize(14);
  pdf.text(`Datum: ${new Date().toLocaleDateString('nl-NL')}`, pageWidth / 2, 370, { align: 'center' });
  pdf.setFontSize(12);
  pdf.text('Zie volgende pagina\'s voor een uitgebreid overzicht van de voortgang en resultaten.', pageWidth / 2, 410, { align: 'center' });
  pdf.addPage();

  // --- Overzicht Voortgang ---
  currentY = margin;
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(22);
  pdf.setFont(undefined, 'bold');
  pdf.text('Overzicht Voortgang', margin, currentY);
  currentY += 30;
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'normal');

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
    },
    braindump: {
      total: basisBraindumps.length,
      scores: {
        Goed: basisBraindumps.filter(bd => bd.score === 'Goed').length,
        Redelijk: basisBraindumps.filter(bd => bd.score === 'Redelijk').length,
        Nee: basisBraindumps.filter(bd => bd.score === 'Nee').length,
      }
    }
  };

  currentY += drawProgressBar(pdf, "Begrippen Trainer", stats.flashcards.completed, stats.flashcards.total, currentY, stats.flashcards.scores, margin, getScoreColor);
  currentY += drawProgressBar(pdf, "Multiple Choice", stats.mcQuestions.completed, stats.mcQuestions.total, currentY, { Correct: stats.mcQuestions.correct }, margin, getScoreColor);
  currentY += drawProgressBar(pdf, "Check je Kennis", stats.uitlegVragen.completed, stats.uitlegVragen.total, currentY, stats.uitlegVragen.scores, margin, getScoreColor);
  currentY += drawProgressBar(pdf, "Klinisch Redeneren", stats.klinischRedeneren.completed, stats.klinischRedeneren.total, currentY, stats.klinischRedeneren.scores, margin, getScoreColor);
  currentY += drawProgressBar(pdf, "Braindump(s)", stats.braindump.total, 1, currentY, stats.braindump.scores, margin, getScoreColor);

  currentY = pageHeight - 120;
  pdf.setFontSize(12);
  pdf.text("Datum van generatie:", margin, currentY);
  pdf.text(new Date().toLocaleDateString('nl-NL'), margin + 150, currentY);

  // --- Bijlagen ---
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
      pdf.setFillColor(249, 250, 251); // gray-50
      pdf.rect(margin - 5, currentY - 15, contentWidth + 10, 25, 'F');
      pdf.setFont(undefined, 'bold');
      pdf.text(card.term, margin, currentY);
      pdf.setFont(undefined, 'normal');
      const scoreColor = getScoreColor(assessment.toLowerCase()); 
      pdf.setTextColor(...scoreColor);
      pdf.text(assessment, margin + 300, currentY);
      pdf.setTextColor(0, 0, 0);
      currentY += 30;
    });
  }

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
      if (currentY > pageHeight - (bottomMargin + 70) ) { // Meer ruimte nodig per MC vraag
        pdf.addPage();
        currentY = margin;
      }
      const score = mcScores[q.id];
      pdf.setFillColor(249, 250, 251);
      pdf.rect(margin - 5, currentY - 15, contentWidth + 10, 80, 'F');
      pdf.setFont(undefined, 'bold');
      let tempY = addWrappedText(pdf, `Vraag ${index + 1}:`, margin, currentY, contentWidth, lineHeight, pageHeight, margin, bottomMargin);
      pdf.setFont(undefined, 'normal');
      tempY = addWrappedText(pdf, q.questionText, margin + 10, tempY + 5, contentWidth - 10, lineHeight, pageHeight, margin, bottomMargin);
      const resultColor = getScoreColor(score); 
      pdf.setTextColor(...resultColor);
      pdf.text(`Resultaat: ${score === 'correct' ? 'Correct' : score === 'incorrect' ? 'Incorrect' : 'Niet beantwoord'}`,
              margin + 10, tempY + 15);
      pdf.setTextColor(0, 0, 0);
      currentY = tempY + 40;
    });
  }

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
      if (currentY > pageHeight - (bottomMargin + 90)) { // Meer ruimte nodig per uitlegvraag
        pdf.addPage();
        currentY = margin;
      }
      const answer = answers[q.id] || '[Niet beantwoord]';
      const score = uitlegScores[q.id] || 'Niet beoordeeld';
      pdf.setFillColor(249, 250, 251);
      pdf.rect(margin - 5, currentY - 15, contentWidth + 10, 120, 'F');
      pdf.setFont(undefined, 'bold');
      let tempY = addWrappedText(pdf, `Vraag ${index + 1} (${q.type === 'client' ? 'Cliënt' : 'Collega'}):`, margin, currentY, contentWidth, lineHeight, pageHeight, margin, bottomMargin);
      pdf.setFont(undefined, 'normal');
      tempY = addWrappedText(pdf, q.questionText, margin + 10, tempY + 5, contentWidth - 10, lineHeight, pageHeight, margin, bottomMargin);
      tempY = addWrappedText(pdf, `Antwoord: ${answer}`, margin + 10, tempY + 5, contentWidth - 10, lineHeight, pageHeight, margin, bottomMargin);
      const scoreColor = getScoreColor(score.toLowerCase()); 
      pdf.setTextColor(...scoreColor);
      pdf.text(`Niveau: ${score}`, margin + 10, tempY + 15);
      pdf.setTextColor(0, 0, 0);
      currentY = tempY + 40;
    });
  }

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
      if (currentY > pageHeight - (bottomMargin + 90)) { // Meer ruimte nodig per casus
        pdf.addPage();
        currentY = margin;
      }
      const answer = answers[c.id] || '[Niet beantwoord]';
      const score = toepassenScores[c.id] || 'Niet beoordeeld';
      pdf.setFillColor(249, 250, 251); // gray-50
      pdf.rect(margin - 5, currentY - 15, contentWidth + 10, 120, 'F');
      pdf.setFont(undefined, 'bold');
      let tempY = addWrappedText(pdf, `Casus ${index + 1}:`, margin, currentY, contentWidth, lineHeight, pageHeight, margin, bottomMargin);
      pdf.setFont(undefined, 'normal');
      tempY = addWrappedText(pdf, c.caseText, margin + 10, tempY + 5, contentWidth - 10, lineHeight, pageHeight, margin, bottomMargin);
      tempY = addWrappedText(pdf, `Analyse: ${answer}`, margin + 10, tempY + 5, contentWidth - 10, lineHeight, pageHeight, margin, bottomMargin);
      const scoreColor = getScoreColor(score.toLowerCase()); 
      pdf.setTextColor(...scoreColor);
      pdf.text(`Niveau: ${score}`, margin + 10, tempY + 15);
      pdf.setTextColor(0, 0, 0);
      currentY = tempY + 40;
    });
  }

  // --- Bijlage: Braindump(s) ---
  if (basisBraindumps && basisBraindumps.length > 0) {
    pdf.addPage();
    currentY = margin;
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text("Bijlage: Braindump Reflecties", margin, currentY);
    currentY += 30;
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    basisBraindumps.forEach((bd, idx) => {
      if (currentY > pageHeight - (bottomMargin + 60)) {
        pdf.addPage();
        currentY = margin;
      }
      pdf.setFillColor(255, 249, 196); // zacht geel
      pdf.rect(margin - 5, currentY - 10, contentWidth + 10, 60, 'F');
      pdf.setFont(undefined, 'bold');
      pdf.text(`Braindump ${idx + 1} (${new Date(bd.date).toLocaleDateString('nl-NL')}):`, margin, currentY);
      pdf.setFont(undefined, 'normal');
      let tempY = addWrappedText(pdf, bd.text, margin + 10, currentY + 15, contentWidth - 10, lineHeight, pageHeight, margin, bottomMargin);
      const scoreColor = getScoreColor(bd.score.toLowerCase());
      pdf.setTextColor(...scoreColor);
      pdf.text(`Score: ${bd.score}`, margin + 10, tempY + 10);
      pdf.setTextColor(0, 0, 0);
      currentY = tempY + 25;
    });
  }

  pdf.save('eJournal_Bindweefselherstel.pdf');
}; 