import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import hanLogo from '../assets/HAN-logo.png';
import hanLongLogo from '../assets/Logo-han-hogeschool-van-arnhem-en-nijmegen.jpg';

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
  // details: { Goed: x, Redelijk: y, Nee: z }
  pdf.setFontSize(13);
  pdf.setTextColor(0,0,0);
  pdf.text(label, margin, y + 8);

  // Balk segmenten
  const barX = margin + 180;
  const barY = y;
  const barW = 220;
  const barH = 16;
  let x = barX;
  let totalCount = 0;
  const keys = Object.keys(details);
  const colors = {
    goed: [76, 175, 80], // groen
    redelijk: [255, 193, 7], // geel
    nee: [244, 67, 54], // rood
    correct: [76, 175, 80],
    incorrect: [244, 67, 54],
    niet: [158, 158, 158], // grijs
  };
  let totalFilled = 0;
  keys.forEach((key) => {
    const val = details[key] || 0;
    if (val > 0) {
      const w = (val / total) * barW;
      pdf.setFillColor(...(colors[key.toLowerCase()] || [158,158,158]));
      pdf.rect(x, barY, w, barH, 'F');
      x += w;
      totalFilled += val;
    }
  });
  // Niet ingevuld segment
  if (totalFilled < total) {
    const w = ((total - totalFilled) / total) * barW;
    pdf.setFillColor(220,220,220);
    pdf.rect(x, barY, w, barH, 'F');
    // dwarse streepjes
    pdf.setDrawColor(180,180,180);
    for(let i=0;i<w;i+=8){
      pdf.line(x+i, barY, x+i+4, barY+barH);
    }
    x += w;
  }
  pdf.setDrawColor(200,200,200);
  pdf.rect(barX, barY, barW, barH);
  // Tekst rechts
  pdf.setFontSize(12);
  pdf.setTextColor(0,0,0);
  pdf.text(`${completed}/${total}`, barX + barW + 18, barY + barH - 2);

  // Bolletjes en labels
  let dotX = barX;
  let dotY = barY + barH + 18;
  let dotSpacing = 70;
  let i = 0;
  keys.forEach((key) => {
    const val = details[key] || 0;
    const color = colors[key.toLowerCase()] || [158,158,158];
    pdf.setFillColor(...color);
    pdf.circle(dotX + i*dotSpacing, dotY, 5, 'F');
    pdf.setTextColor(0,0,0);
    pdf.text(`${key}: ${val}`, dotX + i*dotSpacing + 10, dotY + 3);
    i++;
  });
  // Niet ingevuld bolletje
  if (totalFilled < total) {
    pdf.setFillColor(220,220,220);
    pdf.circle(dotX + i*dotSpacing, dotY, 5, 'F');
    pdf.setTextColor(120,120,120);
    pdf.text(`Niet ingevuld: ${total-totalFilled}`, dotX + i*dotSpacing + 10, dotY + 3);
  }
  // Extra ruimte na elk blok
  return 38 + 18;
};

// Nieuwe drawWideProgressBar voor het totaaloverzicht
const drawWideProgressBar = (pdf, title, details, total, y, margin, contentWidth, colorsMap) => {
  // Titel boven de balk
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.setTextColor(37, 99, 235);
  pdf.text(title, margin, y);
  y += 18;
  // Balk
  const barX = margin;
  const barY = y;
  const barW = contentWidth;
  const barH = 22;
  let x = barX;
  let totalFilled = 0;
  // Geforceerde volgorde: groen, geel, rood, rest
  const order = [
    'goed', 'correct', 'expert', // groen
    'redelijk', 'gevorderd',     // geel
    'nee', 'matig', 'incorrect', 'beginner' // rood
  ];
  const keys = [
    ...order.filter(k => Object.keys(details).includes(k)),
    ...Object.keys(details).filter(k => !order.includes(k))
  ];
  keys.forEach((key) => {
    const val = details[key] || 0;
    if (val > 0) {
      const w = (val / total) * barW;
      pdf.setFillColor(...(colorsMap[key.toLowerCase()] || [158,158,158]));
      pdf.rect(x, barY, w, barH, 'F');
      x += w;
      totalFilled += val;
    }
  });
  // Niet ingevuld segment (alleen als er nog open staat)
  if (totalFilled < total) {
    const w = ((total - totalFilled) / total) * barW;
    pdf.setFillColor(220,220,220);
    pdf.rect(x, barY, w, barH, 'F');
    pdf.setDrawColor(180,180,180);
    for(let i=0;i<w;i+=10){
      pdf.line(x+i, barY, x+i+5, barY+barH);
    }
    x += w;
  }
  pdf.setDrawColor(200,200,200);
  pdf.rect(barX, barY, barW, barH);
  // Tekst rechts
  pdf.setFontSize(12);
  pdf.setTextColor(0,0,0);
  pdf.text(`${totalFilled}/${total}`, barX + barW + 10, barY + barH - 4);
  // Bolletjes en labels
  let dotX = barX;
  let dotY = barY + barH + 18;
  let dotSpacing = 110;
  let i = 0;
  keys.forEach((key) => {
    const val = details[key] || 0;
    const color = colorsMap[key.toLowerCase()] || [158,158,158];
    pdf.setFillColor(...color);
    pdf.circle(dotX + i*dotSpacing, dotY, 6, 'F');
    pdf.setTextColor(0,0,0);
    pdf.text(`${key}: ${val}`, dotX + i*dotSpacing + 14, dotY + 4);
    i++;
  });
  if (totalFilled < total) {
    pdf.setFillColor(220,220,220);
    pdf.circle(dotX + i*dotSpacing, dotY, 6, 'F');
    pdf.setTextColor(120,120,120);
    pdf.text(`Niet ingevuld: ${total-totalFilled}`, dotX + i*dotSpacing + 14, dotY + 4);
  }
  // Extra witruimte en grijze lijn na elke balk
  const extraSpace = 18;
  const lineY = dotY + 12;
  pdf.setDrawColor(220,220,220);
  pdf.setLineWidth(1);
  pdf.line(margin, lineY, margin + contentWidth, lineY);
  return lineY + extraSpace;
};

export const generateCertificatePDF = async (data) => {
  const {
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
    basisBraindumps = [],
    flashcardRepeats = {},
    mcUserAnswers = {},
    uitlegAnswerVersions = {},
    toepassenAnswerVersions = {},
  } = data;

  const pdf = new jsPDF('p', 'pt', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - 2 * margin;
  let currentY = margin;
  const lineHeight = 14;
  const bottomMargin = 50;
  const pagesToNumber = [];

  // --- Certificaat Voorblad ---
  pdf.addImage(hanLogo, 'PNG', pageWidth - 200, margin, 150, 50);
  pdf.setFillColor(240, 240, 240);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  pdf.setDrawColor(37, 99, 235);
  pdf.setLineWidth(2);
  pdf.rect(margin - 10, margin - 10, pageWidth - 2 * (margin - 10), pageHeight - 2 * (margin - 10));
  pdf.setTextColor(37, 99, 235);
  pdf.setFontSize(36);
  pdf.setFont(undefined, 'bold');
  pdf.text('CERTIFICAAT', pageWidth / 2, 120, { align: 'center' });
  pdf.setFontSize(24);
  pdf.text('KennisBooster:', pageWidth / 2, 160, { align: 'center' });
  pdf.text('Bindweefselherstel', pageWidth / 2, 190, { align: 'center' });
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'normal');
  pdf.text('Hierbij wordt verklaard dat', pageWidth / 2, 230, { align: 'center' });
  pdf.setFont(undefined, 'bold');
  pdf.setFontSize(28);
  const fullName = `${firstName || '[Voornaam]'} ${lastName || '[Achternaam]'}`;
  pdf.text(fullName, pageWidth / 2, 270, { align: 'center' });
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(16);
  pdf.text('de interactieve leermodule over bindweefselherstel heeft doorlopen en actief heeft gewerkt aan kennis, begrip en reflectie.', pageWidth / 2, 310, { align: 'center', maxWidth: contentWidth });
  pdf.setFontSize(14);
  pdf.text(`Datum: ${new Date().toLocaleDateString('nl-NL')}`, pageWidth / 2, 370, { align: 'center' });
  // Groot HAN lang logo onderaan pagina 1 binnen het blauwe kader
  const logoMaxWidth = pageWidth - 2 * margin - 80; // iets marge links/rechts
  const logoAspect = 0.25; // Aangepaste geschatte hoogte/breedte verhouding
  const logoWidth = logoMaxWidth;
  const logoHeight = logoWidth * logoAspect;
  const logoX = margin + 40; // gecentreerd binnen kader (marge + extra ruimte)
  const logoY = pageHeight - margin - logoHeight - 40;
  pdf.addImage(hanLongLogo, 'JPEG', logoX, logoY, logoWidth, logoHeight);
  // Footer onderaan pagina 1
  pdf.setFontSize(12);
  pdf.setTextColor(120, 120, 120);
  pdf.text('© 2025 HAN opleiding Fysiotherapie', pageWidth / 2, pageHeight - margin - 10, { align: 'center' });
  pdf.addPage();

  // Voeg HAN-logo rechtsonder toe op het certificaatvoorblad
  pdf.addImage(hanLogo, 'PNG', pageWidth - 140, pageHeight - 140, 100, 100);
  // Footer tekst
  pdf.setFontSize(12);
  pdf.setTextColor(120, 120, 120);
  pdf.text('Deze KennisBooster is onderdeel van de FysioAI LeerToolbox.', pageWidth / 2, pageHeight - 30, { align: 'center' });

  // --- Totaaloverzicht ---
  currentY = margin;
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(22);
  pdf.setFont(undefined, 'bold');
  pdf.text('Totaaloverzicht Resultaten', margin, currentY);
  currentY += 30;
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'normal');
  // Kleuren voor de onderdelen
  const kleuren = {
    goed: [76, 175, 80], // groen
    redelijk: [255, 193, 7], // geel
    matig: [244, 67, 54], // rood
    nee: [244, 67, 54],
    correct: [76, 175, 80],
    incorrect: [244, 67, 54],
    expert: [76, 175, 80],
    gevorderd: [255, 193, 7],
    beginner: [244, 67, 54],
  };
  // Braindump visualisatie
  let braindumpDetails = {};
  if (basisBraindumps.length > 0) {
    // Tel aantal per score
    basisBraindumps.forEach(bd => {
      const score = (bd.score || '').toLowerCase();
      if (score) braindumpDetails[score] = (braindumpDetails[score] || 0) + 1;
    });
  }
  currentY = drawWideProgressBar(
    pdf,
    'De Basis (Braindump)',
    braindumpDetails,
    basisBraindumps.length,
    currentY,
    margin,
    contentWidth,
    kleuren
  ) + 10;
  // Begrippen Trainer
  const flashcardScores = { Goed: 0, Redelijk: 0, Nee: 0 };
  initialFlashcards.forEach(c => {
    const score = flashcardAssessments[c.id];
    if (score) flashcardScores[score] = (flashcardScores[score] || 0) + 1;
  });
  currentY = drawWideProgressBar(
    pdf,
    'Begrippen Trainer',
    flashcardScores,
    initialFlashcards.length,
    currentY,
    margin,
    contentWidth,
    kleuren
  ) + 10;
  // MC Vragen
  const mcCorrect = Object.values(mcScores).filter(s => s === 'correct').length;
  const mcIncorrect = Object.values(mcScores).filter(s => s === 'incorrect').length;
  const mcDetails = { Correct: mcCorrect, Incorrect: mcIncorrect };
  currentY = drawWideProgressBar(
    pdf,
    'MC Vragen',
    mcDetails,
    mcQuestions.length,
    currentY,
    margin,
    contentWidth,
    kleuren
  ) + 10;
  // Check je Kennis
  const uitlegDetails = { expert: 0, gevorderd: 0, beginner: 0 };
  uitlegQuestions.forEach(q => {
    const score = uitlegScores[q.id];
    if (score) uitlegDetails[score] = (uitlegDetails[score] || 0) + 1;
  });
  currentY = drawWideProgressBar(
    pdf,
    'Check je Kennis',
    uitlegDetails,
    uitlegQuestions.length,
    currentY,
    margin,
    contentWidth,
    kleuren
  ) + 10;
  // Klinisch Redeneren
  const toepassenDetails = { expert: 0, gevorderd: 0, beginner: 0 };
  toepassenCases.forEach(c => {
    const score = toepassenScores[c.id];
    if (score) toepassenDetails[score] = (toepassenDetails[score] || 0) + 1;
  });
  currentY = drawWideProgressBar(
    pdf,
    'Klinisch Redeneren',
    toepassenDetails,
    toepassenCases.length,
    currentY,
    margin,
    contentWidth,
    kleuren
  ) + 10;
  pdf.setFontSize(12);
  pdf.setTextColor(0,0,0);
  pdf.text('Datum van generatie:', margin, currentY + 10);
  pdf.text(new Date().toLocaleDateString('nl-NL'), margin + 150, currentY + 10);
  pagesToNumber.push(pdf.internal.getNumberOfPages());

  // --- De Basis (Braindump) ---
  if (basisBraindumps && basisBraindumps.length > 0) {
    pdf.addPage();
    currentY = margin;
    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.text('De Basis: Braindump Reflecties', margin, currentY);
    currentY += 30;
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    basisBraindumps.forEach((bd, idx) => {
      let blockHeight = 80; // Increased height for title
      const lines = pdf.splitTextToSize(bd.text, contentWidth - 20);
      blockHeight += lines.length * lineHeight;
      if (currentY + blockHeight > pageHeight - bottomMargin) {
        pdf.addPage();
        currentY = margin;
      }
      pdf.setFillColor(255, 249, 196);
      pdf.roundedRect(margin - 5, currentY - 10, contentWidth + 10, blockHeight, 8, 8, 'F');
      pdf.setFont(undefined, 'bold');
      pdf.text(`Braindump ${idx + 1} (${new Date(bd.date).toLocaleDateString('nl-NL')}):`, margin, currentY);
      pdf.setFont(undefined, 'normal');
      let tempY = addWrappedText(pdf, `Titel: ${bd.title || 'Geen titel'}`, margin + 10, currentY + 15, contentWidth - 20, lineHeight, pageHeight, margin, bottomMargin);
      tempY = addWrappedText(pdf, bd.text, margin + 10, tempY + 5, contentWidth - 20, lineHeight, pageHeight, margin, bottomMargin);
      tempY = addWrappedText(pdf, `Wat ging goed: ${bd.toelichtingGoed || '-'}`, margin + 10, tempY + 5, contentWidth - 20, lineHeight, pageHeight, margin, bottomMargin);
      tempY = addWrappedText(pdf, `Wat kan beter: ${bd.toelichtingBeter || '-'}`, margin + 10, tempY + 5, contentWidth - 20, lineHeight, pageHeight, margin, bottomMargin);
      const scoreColor = getScoreColor((bd.score || '').toLowerCase());
      pdf.setTextColor(...scoreColor);
      pdf.text(`Score: ${bd.score}`, margin + 10, tempY + 10);
      pdf.setTextColor(0, 0, 0);
      currentY = tempY + 25;
    });
    pagesToNumber.push(pdf.internal.getNumberOfPages());
  }

  // --- Begrippen Trainer ---
  if (Object.keys(flashcardAssessments).length > 0) {
    pdf.addPage();
    currentY = margin;
    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.text('Begrippen Trainer: Beoordelingen', margin, currentY);
    currentY += 30;
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    // Tabel header
    const colWidths = [0.45, 0.20, 0.18, 0.17]; // som = 1, meer ruimte voor term
    const headers = ['Term', 'Beoordeling', 'Niveau', 'Herhalingen'];
    let x = margin;
    headers.forEach((h, i) => {
      pdf.setFont(undefined, 'bold');
      pdf.text(h, x, currentY);
      x += colWidths[i] * contentWidth;
    });
    currentY += 18;
    pdf.setFont(undefined, 'normal');

    // Sorteer de flashcards op niveau en dan op term
    const sortedFlashcards = [...initialFlashcards].sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.term.localeCompare(b.term);
    });

    // Voeg zowel normale als reverse kaarten toe aan de lijst
    const allFlashcards = sortedFlashcards.flatMap(card => {
      const cards = [{ ...card }];  // Clone the card to avoid reference issues
      if (card.reverse) {
        // Voor reverse kaarten, maak een nieuwe kaart met de juiste ID
        const reverseCard = {
          ...card,
          id: `${card.id}_reverse`,
          term: `${card.term} (omgekeerd)`,
          isReverse: true,
          originalId: card.id  // Bewaar het originele ID voor referentie
        };
        cards.push(reverseCard);
      }
      return cards;
    });

    allFlashcards.forEach(card => {
      if (currentY > pageHeight - bottomMargin) {
        pdf.addPage();
        currentY = margin;
        pagesToNumber.push(pdf.internal.getNumberOfPages());
      }

      x = margin;
      const assessment = flashcardAssessments[card.id];
      if (assessment) {
        // Term - met text wrapping als nodig
        const termWidth = colWidths[0] * contentWidth - 10; // 10px marge
        const wrappedTerm = pdf.splitTextToSize(card.term, termWidth);
        pdf.text(wrappedTerm, x, currentY);
        x += colWidths[0] * contentWidth;
        
        // Beoordeling
        pdf.text(assessment, x, currentY);
        x += colWidths[1] * contentWidth;
        
        // Niveau
        pdf.text(`Niveau ${card.level}`, x, currentY);
        x += colWidths[2] * contentWidth;
        
        // Herhalingen
        let repeats = 0;
        const cardId = card.isReverse ? `${card.originalId}_reverse` : card.id;
        repeats = flashcardRepeats[cardId] || 0;
        pdf.text(repeats.toString(), x, currentY);
        
        currentY += 14;
      }
    });
    pagesToNumber.push(pdf.internal.getNumberOfPages());
  }

  // --- MC Vragen ---
  if (Object.keys(mcScores).length > 0) {
    pdf.addPage();
    currentY = margin;
    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.text('MC Vragen: Resultaten', margin, currentY);
    currentY += 30;
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    mcQuestions.forEach((q, index) => {
      if (currentY > pageHeight - (bottomMargin + 120)) {
        pdf.addPage();
        currentY = margin;
      }
      const score = mcScores[q.id];
      const userAnswerIdx = mcUserAnswers[q.id];
      const userAnswer = (userAnswerIdx !== undefined && q.options && q.options[userAnswerIdx] !== undefined) ? q.options[userAnswerIdx] : '-';
      const correctAnswer = (q.correctOptionIndex !== undefined && q.options && q.options[q.correctOptionIndex] !== undefined) ? q.options[q.correctOptionIndex] : '-';
      pdf.setFillColor(249, 250, 251);
      pdf.rect(margin - 5, currentY - 15, contentWidth + 10, 120, 'F');
      pdf.setFont(undefined, 'bold');
      let tempY = addWrappedText(pdf, `Vraag ${index + 1}:`, margin, currentY, contentWidth, lineHeight, pageHeight, margin, bottomMargin);
      pdf.setFont(undefined, 'normal');
      tempY = addWrappedText(pdf, q.questionText, margin + 10, tempY + 5, contentWidth - 10, lineHeight, pageHeight, margin, bottomMargin);
      const resultColor = getScoreColor(score);
      pdf.setTextColor(...resultColor);
      pdf.text(`Resultaat: ${score === 'correct' ? 'Correct' : score === 'incorrect' ? 'Incorrect' : 'Niet beantwoord'}`, margin + 10, tempY + 15);
      pdf.setTextColor(0, 0, 0);
      tempY += 35; // EXTRA witruimte
      tempY = addWrappedText(pdf, `Jouw antwoord: ${userAnswer}`, margin + 10, tempY, contentWidth - 10, lineHeight, pageHeight, margin, bottomMargin);
      tempY = addWrappedText(pdf, `Correct antwoord: ${correctAnswer}`, margin + 10, tempY + 5, contentWidth - 10, lineHeight, pageHeight, margin, bottomMargin);
      currentY = tempY + 40;
    });
    pagesToNumber.push(pdf.internal.getNumberOfPages());
  }

  // --- Check je Kennis ---
  if (Object.keys(uitlegScores).length > 0 || uitlegQuestions.some(q => answers[q.id])) {
    pdf.addPage();
    currentY = margin;
    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.text('Check je Kennis: Resultaten', margin, currentY);
    currentY += 30;
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    uitlegQuestions.forEach((q, index) => {
      if (currentY > pageHeight - (bottomMargin + 150)) {
        pdf.addPage();
        currentY = margin;
      }
      const answerVersions = uitlegAnswerVersions[q.id] || [];
      const latestAnswer = answerVersions.length > 0 ? answerVersions[answerVersions.length - 1] : null;
      pdf.setFillColor(249, 250, 251);
      pdf.rect(margin - 5, currentY - 15, contentWidth + 10, 150, 'F');
      pdf.setFont(undefined, 'bold');
      let tempY = addWrappedText(pdf, `Vraag ${index + 1} (${q.type === 'client' ? 'Cliënt' : 'Collega'}):`, margin, currentY, contentWidth, lineHeight, pageHeight, margin, bottomMargin);
      pdf.setFont(undefined, 'normal');
      tempY = addWrappedText(pdf, q.questionText, margin + 10, tempY + 5, contentWidth - 10, lineHeight, pageHeight, margin, bottomMargin);
      // Latest answer in green box
      if (latestAnswer) {
        pdf.setFillColor(220, 255, 220);
        pdf.roundedRect(margin, tempY + 5, contentWidth, 40, 3, 3, 'F');
        tempY = addWrappedText(pdf, `Laatste antwoord (${new Date(latestAnswer.timestamp).toLocaleDateString('nl-NL')}):`, margin + 5, tempY + 15, contentWidth - 10, lineHeight, pageHeight, margin, bottomMargin);
        tempY = addWrappedText(pdf, latestAnswer.answer, margin + 5, tempY + 5, contentWidth - 10, lineHeight, pageHeight, margin, bottomMargin);
        // Niveau direct onder antwoord
        const scoreColor = getScoreColor((latestAnswer.score || '').toLowerCase());
        pdf.setTextColor(...scoreColor);
        pdf.text(`Niveau: ${latestAnswer.score || '-'}`, margin + 10, tempY + 10);
        pdf.setTextColor(0, 0, 0);
        tempY += 25;
      } else {
        tempY = addWrappedText(pdf, `Laatste antwoord: -`, margin + 5, tempY + 15, contentWidth - 10, lineHeight, pageHeight, margin, bottomMargin);
      }
      // Previous versions in gray boxes
      if (answerVersions.length > 1) {
        tempY += 10;
        pdf.setFont(undefined, 'bold');
        tempY = addWrappedText(pdf, 'Eerdere versies:', margin, tempY, contentWidth, lineHeight, pageHeight, margin, bottomMargin);
        pdf.setFont(undefined, 'normal');
        for (let i = answerVersions.length - 2; i >= 0; i--) {
          const version = answerVersions[i];
          pdf.setFillColor(240, 240, 240);
          pdf.roundedRect(margin, tempY + 5, contentWidth, 40, 3, 3, 'F');
          tempY = addWrappedText(pdf, `Versie ${i + 1} (${new Date(version.timestamp).toLocaleDateString('nl-NL')}):`, margin + 5, tempY + 15, contentWidth - 10, lineHeight, pageHeight, margin, bottomMargin);
          tempY = addWrappedText(pdf, version.answer, margin + 5, tempY + 5, contentWidth - 10, lineHeight, pageHeight, margin, bottomMargin);
          // Niveau direct onder antwoord
          const scoreColor = getScoreColor((version.score || '').toLowerCase());
          pdf.setTextColor(...scoreColor);
          pdf.text(`Niveau: ${version.score || '-'}`, margin + 10, tempY + 10);
          pdf.setTextColor(0, 0, 0);
          tempY += 25;
        }
      }
      currentY = tempY + 20;
    });
    pagesToNumber.push(pdf.internal.getNumberOfPages());
  }

  // --- Klinisch Redeneren ---
  if (Object.keys(toepassenScores).length > 0 || toepassenCases.some(c => answers[c.id])) {
    pdf.addPage();
    currentY = margin;
    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.text('Klinisch Redeneren: Resultaten', margin, currentY);
    currentY += 30;
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    toepassenCases.forEach((c, index) => {
      if (currentY > pageHeight - (bottomMargin + 150)) {
        pdf.addPage();
        currentY = margin;
      }
      const answerVersions = toepassenAnswerVersions[c.id] || [];
      const latestAnswer = answerVersions.length > 0 ? answerVersions[answerVersions.length - 1] : null;
      pdf.setFillColor(249, 250, 251);
      pdf.rect(margin - 5, currentY - 15, contentWidth + 10, 150, 'F');
      pdf.setFont(undefined, 'bold');
      let tempY = addWrappedText(pdf, `${c.title}:`, margin, currentY, contentWidth, lineHeight, pageHeight, margin, bottomMargin);
      pdf.setFont(undefined, 'normal');
      tempY = addWrappedText(pdf, c.caseDescription, margin + 10, tempY + 5, contentWidth - 10, lineHeight, pageHeight, margin, bottomMargin);
      tempY = addWrappedText(pdf, c.question, margin + 10, tempY + 5, contentWidth - 10, lineHeight, pageHeight, margin, bottomMargin);
      // Latest answer in green box
      if (latestAnswer) {
        pdf.setFillColor(220, 255, 220);
        pdf.roundedRect(margin, tempY + 5, contentWidth, 40, 3, 3, 'F');
        tempY = addWrappedText(pdf, `Laatste analyse (${new Date(latestAnswer.timestamp).toLocaleDateString('nl-NL')}):`, margin + 5, tempY + 15, contentWidth - 10, lineHeight, pageHeight, margin, bottomMargin);
        tempY = addWrappedText(pdf, latestAnswer.answer, margin + 5, tempY + 5, contentWidth - 10, lineHeight, pageHeight, margin, bottomMargin);
        // Niveau direct onder antwoord
        const scoreColor = getScoreColor((latestAnswer.score || '').toLowerCase());
        pdf.setTextColor(...scoreColor);
        pdf.text(`Niveau: ${latestAnswer.score || '-'}`, margin + 10, tempY + 10);
        pdf.setTextColor(0, 0, 0);
        tempY += 25;
      } else {
        tempY = addWrappedText(pdf, `Laatste analyse: -`, margin + 5, tempY + 15, contentWidth - 10, lineHeight, pageHeight, margin, bottomMargin);
      }
      // Previous versions in gray boxes
      if (answerVersions.length > 1) {
        tempY += 10;
        pdf.setFont(undefined, 'bold');
        tempY = addWrappedText(pdf, 'Eerdere versies:', margin, tempY, contentWidth, lineHeight, pageHeight, margin, bottomMargin);
        pdf.setFont(undefined, 'normal');
        for (let i = answerVersions.length - 2; i >= 0; i--) {
          const version = answerVersions[i];
          pdf.setFillColor(240, 240, 240);
          pdf.roundedRect(margin, tempY + 5, contentWidth, 40, 3, 3, 'F');
          tempY = addWrappedText(pdf, `Versie ${i + 1} (${new Date(version.timestamp).toLocaleDateString('nl-NL')}):`, margin + 5, tempY + 15, contentWidth - 10, lineHeight, pageHeight, margin, bottomMargin);
          tempY = addWrappedText(pdf, version.answer, margin + 5, tempY + 5, contentWidth - 10, lineHeight, pageHeight, margin, bottomMargin);
          // Niveau direct onder antwoord
          const scoreColor = getScoreColor((version.score || '').toLowerCase());
          pdf.setTextColor(...scoreColor);
          pdf.text(`Niveau: ${version.score || '-'}`, margin + 10, tempY + 10);
          pdf.setTextColor(0, 0, 0);
          tempY += 25;
        }
      }
      currentY = tempY + 20;
    });
    pagesToNumber.push(pdf.internal.getNumberOfPages());
  }

  // --- Paginanummers toevoegen ---
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`Pagina ${i} van ${totalPages}`, pageWidth - margin - 80, pageHeight - 20);
  }

  pdf.save('eJournal_Bindweefselherstel.pdf');
}; 