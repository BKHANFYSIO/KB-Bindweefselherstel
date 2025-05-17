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
  const extraSpace = 30;
  const lineY = dotY + 18;
  pdf.setDrawColor(220,220,220);
  pdf.setLineWidth(1);
  pdf.line(margin, lineY, margin + contentWidth, lineY);
  return lineY + extraSpace;
};

// --- Styling helpers voor niveau-kleur ---
const niveauColors = {
  beginner: { bg: [255, 205, 210], text: [255, 255, 255] }, // zacht rood, witte tekst
  gevorderd: { bg: [255, 236, 179], text: [50, 50, 50] }, // zacht geel, donkergrijze tekst voor beter contrast
  expert: { bg: [200, 230, 201], text: [50, 50, 50] }, // zacht groen, donkergrijze tekst voor beter contrast
};

// Helper: normaliseer tekst (verwijder diverse Unicode spaties, tabs, normaliseer newlines, trim)
function normalizeText(text) {
  if (!text) return '';
  // Stap 1: Normaliseer alle soorten witruimte (inclusief diverse Unicode spaties en tabs) naar een standaard spatie.
  //   = No-Break Space,   = Ogham Space Mark,  -  = En Quad, Em Quad, Three-Per-Em Space, etc.,
  //   = Narrow No-Break Space,   = Medium Mathematical Space, 　 = Ideographic Space.
  let normalized = text.replace(/[\s\t\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]+/g, ' ');
  
  // Stap 1.5: Vervang specifieke problematische karakters
  normalized = normalized.replace(/%/g, 'procent'); // Vervang %-teken om problemen te voorkomen
  normalized = normalized.replace(/¼/g, '1/4');
  normalized = normalized.replace(/½/g, '1/2');
  normalized = normalized.replace(/¾/g, '3/4');
  
  // Stap 1.6: Verwijder karakters die niet behoren tot een 'veilige' set.
  // Deze regex probeert het volgende te behouden:
  // - Latijnse basisletters (a-z, A-Z)
  // - Cijfers (0-9)
  // - Veel voorkomende Latijnse letters met accenten (À-ÖØ-öø-ÿ)
  // - Standaard leestekens: spatie, punt, komma, puntkomma, dubbelepunt, uitroepteken, vraagteken, apostrof, aanhalingstekens, haakjes, streepje, slash
  // - Nieuwe regels (\n) die later correct worden verwerkt.
  // Alle andere karakters (inclusief veel onzichtbare control-karakters, zeldzamere symbolen, etc.) worden verwijderd.
  normalized = normalized.replace(/[^a-zA-Z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\s\.,;:!?'"()[\]\-\/\n\\]/g, ''); 
  // De dubbele backslash voor \n en \ is om ze correct in de regex string te escapen.

  // Stap 2: Normaliseer newlines (converteer \r\n of \r naar \n) - dit is belangrijk NA de custom char stripping, 
  // zodat \n niet per ongeluk gestript wordt als het niet in de regex hierboven expliciet was toegestaan.
  // Echter, de regex hierboven staat \n nu expliciet toe.
  normalized = normalized.replace(/\r\n?/g, '\n');
  // Stap 3: Vervang meerdere standaard spaties (die kunnen zijn ontstaan) door een enkele spatie.
  // Belangrijk: dit moet na newline normalisatie om te voorkomen dat spaties rond newlines foutief samengevoegd worden.
  normalized = normalized.split('\n').map(line => line.replace(/ +/g, ' ').trim()).join('\n');
  // Stap 4: Trim eventuele overgebleven witruimte van de gehele tekst.
  return normalized.trim();
}

// Helper: blok tekenen met automatische paginawissel/splitsing
function drawBlockWithAutoPage(pdf, lines, blockX, blockY, blockW, blockH, margin, pageHeight, bottomMargin, addRoundedRect = true) {
  let y = blockY;
  let lineHeight = 18;
  let linesPerPage = Math.floor((pageHeight - bottomMargin - y - 10) / lineHeight);
  let i = 0;
  let firstPage = true;
  let totalLines = lines.length;
  let drawnLines = 0;
  while (drawnLines < totalLines) {
    let remainingLines = totalLines - drawnLines;
    let linesThisPage = Math.min(remainingLines, linesPerPage);
    let blockHeightThisPage = linesThisPage * lineHeight + 38 + 30;
    pdf.setFillColor(...kleur.bg);
    pdf.roundedRect(margin, y, barWidth + 50, blockHeightThisPage, 6, 6, 'F');

    let yTextForLines = y + 18; // Initialize y-position for text lines for this iteration/page segment

    if (firstPage) {
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Laatste analyse:', margin + 10, yTextForLines); // Use yTextForLines for the header
      yTextForLines += 18; // Increment for the space taken by the header
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(0, 0, 0);
      firstPage = false; // Ensure firstPage is set to false HERE, inside the block
    }

    // yTextForLines now holds the correct starting Y for the answer text lines
    for (let j = 0; j < linesThisPage; j++) {
      // This is the critical line (original line 939)
      pdf.text(answerLines[drawnLines + j], margin + 15, yTextForLines);
      yTextForLines += lineHeight; // Increment for the next line
    }

    let yTextAfterLines = yTextForLines; // Capture the y-position after drawing text lines

    // Niveau label alleen op laatste pagina
    if (drawnLines + linesThisPage === totalLines && niveauColors[niveau]) {
      pdf.setFillColor(...kleur.bg);
      pdf.setTextColor(...kleur.text);
      pdf.setFont(undefined, 'bold');
      // Use yTextAfterLines for positioning the Niveau label
      pdf.roundedRect(margin + 10, yTextAfterLines, 80, 22, 8, 8, 'F');
      pdf.text(latest.score.charAt(0).toUpperCase() + latest.score.slice(1), margin + 50, yTextAfterLines + 15, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, 'normal');
      yTextAfterLines += 32; // Increment for the space taken by the Niveau label
    }
    drawnLines += linesThisPage;

    if (drawnLines < totalLines) {
      pdf.addPage();
      y = margin; // Reset y for the new page
      // For the new page, firstPage will be false (already set). 
      // yTextForLines will be recalculated at the start of the next 'while' iteration based on the new 'y'.
      linesPerPage = Math.floor((pageHeight - bottomMargin - y - 10 - 38 - 30) / lineHeight);
    }
    // Update currentY based on the final y position after all elements in this segment
    // This ensures currentY reflects the actual end position for the next block outside this while loop.
    if (drawnLines >= totalLines) { // Only update currentY if we are done with this answer block.
         currentY = yTextAfterLines + 10; 
    }
  }
  currentY = yTextAfterLines + 10; 
}

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
  
  // Stap 1: Vul de HELE pagina met lichtgrijs (buitenste achtergrond)
  pdf.setFillColor(240, 240, 240); // Light grey
  pdf.rect(0, 0, pageWidth, pageHeight, 'F'); 

  // Stap 2: Definieer de afmetingen voor het binnenste (witte) gebied en de blauwe rand
  const innerRectX = margin - 10;
  const innerRectY = margin - 10;
  const innerRectWidth = pageWidth - 2 * (margin - 10);
  const innerRectHeight = pageHeight - 2 * (margin - 10);

  // Stap 3: Vul het BINNENSTE gebied met wit
  pdf.setFillColor(255, 255, 255); // White
  pdf.rect(innerRectX, innerRectY, innerRectWidth, innerRectHeight, 'F');
  
  // Stap 4: Teken de blauwe rand BOVENOP het witte gebied
  pdf.setDrawColor(37, 99, 235); // Blue for border
  pdf.setLineWidth(2);
  pdf.rect(innerRectX, innerRectY, innerRectWidth, innerRectHeight); // Draws the blue border (stroke)
  
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
    niet: [244, 67, 54], // rood (was nee)
    correct: [76, 175, 80],
    incorrect: [244, 67, 54],
    expert: [76, 175, 80],
    gevorderd: [255, 193, 7],
    beginner: [244, 67, 54],
  };
  // --- Totaaloverzicht volgorde en balkbreedte ---
  const barWidth = contentWidth * 0.8;
  let braindumpDetails = {};
  if (basisBraindumps.length > 0) {
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
    barWidth,
    kleuren
  ) + 10;
  // Begrippen Trainer
  const flashcardScores = { Goed: 0, Redelijk: 0, Niet: 0 };
  Object.keys(flashcardAssessments).forEach(cardId => {
    let score = flashcardAssessments[cardId];
    if (score === 'Nee') score = 'Niet';
    if (score) flashcardScores[score] = (flashcardScores[score] || 0) + 1;
  });
  currentY = drawWideProgressBar(
    pdf,
    'Begrippen Trainer',
    flashcardScores,
    initialFlashcards.length,
    currentY,
    margin,
    barWidth,
    kleuren
  ) + 10;
  // MC Vragen
  const mcAnswered = mcQuestions.filter(q => mcScores[q.id]);
  const mcCorrect = mcAnswered.filter(q => mcScores[q.id] === 'correct').length;
  const mcIncorrect = mcAnswered.filter(q => mcScores[q.id] === 'incorrect').length;
  const mcDetails = { Correct: mcCorrect, Incorrect: mcIncorrect };
  currentY = drawWideProgressBar(
    pdf,
    'MC Vragen',
    mcDetails,
    mcQuestions.length,
    currentY,
    margin,
    barWidth,
    kleuren
  ) + 10;
  // Check je Kennis
  const uitlegDetails = { expert: 0, gevorderd: 0, beginner: 0 };
  uitlegQuestions.forEach(q => {
    const answerVersions = uitlegAnswerVersions[q.id] || [];
    // Kijk naar alle versies, niet alleen de laatste
    const anyAnswered = answerVersions.some(a => a.answer && a.answer.trim() !== '');
    if (anyAnswered) {
      // Pak het hoogste niveau van alle versies
      const highest = answerVersions.reduce((acc, a) => {
        if (a.score && ['expert','gevorderd','beginner'].includes(a.score.toLowerCase())) {
          if (!acc) return a.score.toLowerCase();
          if (a.score.toLowerCase() === 'expert') return 'expert';
          if (a.score.toLowerCase() === 'gevorderd' && acc !== 'expert') return 'gevorderd';
          if (a.score.toLowerCase() === 'beginner' && acc === undefined) return 'beginner';
        }
        return acc;
      }, undefined);
      if (highest) uitlegDetails[highest] = (uitlegDetails[highest] || 0) + 1;
    }
  });
  currentY = drawWideProgressBar(
    pdf,
    'Check je Kennis',
    uitlegDetails,
    uitlegQuestions.length,
    currentY,
    margin,
    barWidth,
    kleuren
  ) + 10;
  // Klinisch Redeneren
  const toepassenDetails = { expert: 0, gevorderd: 0, beginner: 0 };
  toepassenCases.forEach(c => {
    const answerVersions = toepassenAnswerVersions[c.id] || [];
    const anyAnswered = answerVersions.some(a => a.answer && a.answer.trim() !== '');
    if (anyAnswered) {
      // Pak het hoogste niveau van alle versies
      const highest = answerVersions.reduce((acc, a) => {
        if (a.score && ['expert','gevorderd','beginner'].includes(a.score.toLowerCase())) {
          if (!acc) return a.score.toLowerCase();
          if (a.score.toLowerCase() === 'expert') return 'expert';
          if (a.score.toLowerCase() === 'gevorderd' && acc !== 'expert') return 'gevorderd';
          if (a.score.toLowerCase() === 'beginner' && acc === undefined) return 'beginner';
        }
        return acc;
      }, undefined);
      if (highest) toepassenDetails[highest] = (toepassenDetails[highest] || 0) + 1;
    }
  });
  currentY = drawWideProgressBar(
    pdf,
    'Klinisch Redeneren',
    toepassenDetails,
    toepassenCases.length,
    currentY,
    margin,
    barWidth,
    kleuren
  ) + 10;
  pdf.setFontSize(12);
  pdf.setTextColor(0,0,0);
  pdf.text('Datum van generatie:', margin, currentY + 10);
  pdf.text(new Date().toLocaleDateString('nl-NL'), margin + 150, currentY + 10);
  pagesToNumber.push(pdf.internal.getNumberOfPages());

  // --- Bijlagen volgorde ---
  // Define all sections that must appear in the appendix
  const appendixSections = [
    {
      title: 'De Basis: Braindump Reflecties',
      hasData: () => basisBraindumps && basisBraindumps.length > 0,
      renderData: () => {
        basisBraindumps.forEach((bd, idx) => {
          const braindumpTitleText = `Braindump ${idx + 1} (${new Date(bd.date).toLocaleDateString('nl-NL')}):`; // Renamed to avoid conflict
          const titleContentText = `Titel: ${bd.title || 'Geen titel'}`;
          const braindumpContent = bd.text || 'Geen inhoud';
          const goodText = `Wat ging goed: ${bd.toelichtingGoed || '-'}`;
          const betterText = `Wat kan beter: ${bd.toelichtingBeter || '-'}`;
          const scoreDisplayText = `Score: ${bd.score || 'Niet gescoord'}`; // Renamed for clarity
          const scoreColor = getScoreColor((bd.score || '').toLowerCase());
          const smallLineHeight = 12;

          // Calculate dynamic height for the content block (everything inside the colored box)
          let linesForBlock = 0;
          const countBdLines = (text, maxWidth) => pdf.splitTextToSize(text, maxWidth).length;
          
          linesForBlock += countBdLines(titleContentText, contentWidth - 20);
          linesForBlock += countBdLines(braindumpContent, contentWidth - 20);
          linesForBlock += countBdLines(goodText, contentWidth - 20);
          linesForBlock += countBdLines(betterText, contentWidth - 20);
          linesForBlock += countBdLines(scoreDisplayText, contentWidth - 20); // Score is now inside
          
          // Estimate block height: lines * smallLineHeight + padding for each part + main padding
          // 5 parts: Titel, Content, Goed, Beter, Score. Each gets a bit of padding before it.
          const internalPaddingPerPart = 4; // Small space before each text item inside the box
          const boxBasePadding = 10; // Padding at the top and bottom of the box content area
          let calculatedBlockHeight = linesForBlock * smallLineHeight + (5 * internalPaddingPerPart) + (2 * boxBasePadding);

          // Space needed for the braindump title (drawn above the box) + the box itself
          const totalSpaceForEntry = 20 + calculatedBlockHeight + 15; // 20 for title, 15 for space after box

          if (currentY + totalSpaceForEntry > pageHeight - bottomMargin) { 
            pdf.addPage();
            currentY = margin;
          }

          // 1. Draw Braindump Title (e.g., Braindump 1 (17-5-2025):)
          pdf.setFontSize(14);
          pdf.setFont(undefined, 'bold');
          pdf.setTextColor(0,0,0);
          pdf.text(braindumpTitleText, margin, currentY);
          currentY += 20; // Space after this title, before the box starts

          // 2. Determine box color based on score
          let currentBoxColor = [245, 245, 245]; // Default light grey for the box
          const normalizedScore = (bd.score || '').toLowerCase(); 
          if (normalizedScore === 'goed' || normalizedScore === 'expert') {
            currentBoxColor = [200, 230, 201]; // Soft green
          } else if (normalizedScore === 'redelijk' || normalizedScore === 'gevorderd') {
            currentBoxColor = [255, 236, 179]; // Soft yellow
          } else if (normalizedScore === 'matig' || normalizedScore === 'beginner') {
            currentBoxColor = [255, 205, 210]; // Soft red
          }

          // 3. Draw the colored box
          pdf.setFillColor(...currentBoxColor);
          pdf.roundedRect(margin, currentY, contentWidth, calculatedBlockHeight, 6, 6, 'F');
          
          // 4. Draw content inside the box
          let textY = currentY + boxBasePadding; // Start text with padding inside the box
          pdf.setFontSize(10);
          pdf.setFont(undefined, 'normal');
          pdf.setTextColor(50, 50, 50); // Dark grey for readability

          // Titel: ...
          pdf.setFont(undefined, 'bold');
          textY = addWrappedText(pdf, titleContentText, margin + 10, textY, contentWidth - 20, smallLineHeight, pageHeight, margin, bottomMargin);
          textY += internalPaddingPerPart;
          pdf.setFont(undefined, 'normal');
          
          // Main braindump text
          textY = addWrappedText(pdf, braindumpContent, margin + 10, textY, contentWidth - 20, smallLineHeight, pageHeight, margin, bottomMargin);
          textY += internalPaddingPerPart;
          
          // Wat ging goed:
          pdf.setFont(undefined, 'bold');
          textY = addWrappedText(pdf, goodText, margin + 10, textY, contentWidth - 20, smallLineHeight, pageHeight, margin, bottomMargin);
          textY += internalPaddingPerPart;
          pdf.setFont(undefined, 'normal');

          // Wat kan beter:
          pdf.setFont(undefined, 'bold');
          textY = addWrappedText(pdf, betterText, margin + 10, textY, contentWidth - 20, smallLineHeight, pageHeight, margin, bottomMargin);
          textY += internalPaddingPerPart;
          pdf.setFont(undefined, 'normal');
          
          // Score (now inside the box, at the bottom)
          pdf.setFont(undefined, 'bold');
          pdf.setTextColor(...scoreColor); // Use dynamic color for score text itself
          // The addWrappedText for score should ideally not cause a page break if blockHeight was calculated correctly
          addWrappedText(pdf, scoreDisplayText, margin + 10, textY, contentWidth - 20, smallLineHeight, pageHeight, margin, bottomMargin);
          pdf.setTextColor(50,50,50); // Reset to default dark grey for next element outside this function if any

          // Update currentY to be below the drawn box, ready for the next braindump or section
          currentY += calculatedBlockHeight + 15; // Space after the entire braindump entry
        });
      }
    },
    {
      title: 'Begrippen Trainer: Beoordelingen',
      hasData: () => initialFlashcards && initialFlashcards.length > 0, // Section should appear if cards exist, even if none are assessed
      renderData: () => {
        // Create a list of all potential flashcards (initial + reverse)
        const allPotentialFlashcards = initialFlashcards.flatMap(card => {
          const cards = [{ ...card }];
          if (card.reverse) {
            const reverseCard = {
              ...card,
              id: `${card.id}_reverse`,
              term: `${card.term} (omgekeerd)`,
              isReverse: true,
              originalId: card.id
            };
            cards.push(reverseCard);
          }
          return cards;
        });

        // Filter these down to only those that have an assessment, and map necessary data
        const assessedFlashcardsDetails = allPotentialFlashcards
          .filter(card => flashcardAssessments[card.id] !== undefined)
          .map(card => ({
            ...card,
            assessment: flashcardAssessments[card.id],
            repeats: flashcardRepeats[card.isReverse ? `${card.originalId}_reverse` : card.id] || 0
          }))
          .sort((a, b) => { // Sort the assessed cards by level, then by term
            const levelA = parseInt(a.level, 10) || 0;
            const levelB = parseInt(b.level, 10) || 0;
            if (levelA !== levelB) return levelA - levelB;
            return (a.term || '').localeCompare(b.term || '');
          });

        if (assessedFlashcardsDetails.length === 0) {
          pdf.setFontSize(12);
          pdf.setFont(undefined, 'normal');
          pdf.text('Geen begrippen geoefend of beoordeeld voor dit onderdeel.', margin, currentY);
          currentY += 20;
        } else {
          pdf.setFontSize(10);
          pdf.setFont(undefined, 'normal');
          const colWidths = [0.45, 0.20, 0.18, 0.17];
          const headers = ['Term', 'Beoordeling', 'Niveau', 'Herhalingen'];
          let xH = margin; // Use xH for header drawing to avoid conflict with x in loop
          headers.forEach((h, i) => {
            pdf.setFont(undefined, 'bold');
            pdf.text(h, xH, currentY);
            xH += colWidths[i] * contentWidth;
          });
          currentY += 18;
          pdf.setDrawColor(150, 150, 150);
          pdf.setLineWidth(0.5);
          pdf.line(margin, currentY - 8, margin + contentWidth, currentY - 8);
          currentY += 5;
          pdf.setFont(undefined, 'normal');

          assessedFlashcardsDetails.forEach(card => {
            let x = margin;
            const termWidth = colWidths[0] * contentWidth - 10;
            const wrappedTerm = pdf.splitTextToSize(card.term || 'Onbekende term', termWidth);
            let termLines = wrappedTerm.length;
            let entryHeight = termLines * lineHeight; // Base height on term lines

            if (currentY + entryHeight > pageHeight - bottomMargin) {
              pdf.addPage();
              currentY = margin;
              let newXH = margin;
              headers.forEach((h, i) => {
                pdf.setFont(undefined, 'bold');
                pdf.text(h, newXH, currentY);
                newXH += colWidths[i] * contentWidth;
              });
              currentY += 18;
              pdf.setDrawColor(150, 150, 150);
              pdf.setLineWidth(0.5);
              pdf.line(margin, currentY - 8, margin + contentWidth, currentY - 8);
              currentY += 5;
              pdf.setFont(undefined, 'normal');
            }

            let termY = currentY;
            wrappedTerm.forEach(line => {
              pdf.text(line, x, termY);
              termY += lineHeight;
            });
            x += colWidths[0] * contentWidth;
            
            pdf.text(card.assessment, x, currentY); // Assessment will exist
            x += colWidths[1] * contentWidth;
            
            pdf.text(card.level ? `Niveau ${card.level}` : '-', x, currentY);
            x += colWidths[2] * contentWidth;
            
            pdf.text(card.repeats.toString(), x, currentY);
            
            currentY = Math.max(currentY + lineHeight, termY); // Ensure currentY advances correctly based on wrapped term height
          });
        }
        currentY += 15; // Added extra space after the table or message
      }
    },
    {
      title: 'MC Vragen: Resultaten',
      hasData: () => mcQuestions && mcQuestions.length > 0,
      renderData: () => {
        const mcTypes = [
          { key: 'kennis', label: 'Kennisvragen' },
          { key: 'begrip', label: 'Begripvragen' },
          { key: 'toepassing', label: 'Toepassingsvragen' },
        ];
        let mcAnyAnsweredOverall = false;
        mcTypes.forEach(typeObj => {
          const allQuestionsOfType = mcQuestions.filter(q => q.niveau === typeObj.key);
          const answeredQuestionsOfType = allQuestionsOfType.filter(q => mcScores[q.id]);

          pdf.setFont(undefined, 'bold');
          pdf.setFontSize(14);
          pdf.text(typeObj.label, margin, currentY);
          currentY += 18;
          pdf.setFont(undefined, 'normal');
          pdf.setFontSize(10);

          if (allQuestionsOfType.length === 0) {
            pdf.text(`Geen vragen van het type '${typeObj.label.toLowerCase()}' in deze module.`, margin, currentY);
            currentY += 16;
          } else if (answeredQuestionsOfType.length === 0) {
            pdf.text(`Geen vragen beantwoord voor ${typeObj.label.toLowerCase()}.`, margin, currentY);
            currentY += 16;
          } else {
            mcAnyAnsweredOverall = true;
            answeredQuestionsOfType.forEach((q, index) => {
              if (currentY > pageHeight - (bottomMargin + 120)) { // Estimate for block height
                pdf.addPage();
                currentY = margin;
              }
              const score = mcScores[q.id];
              const userAnswerIdx = mcUserAnswers[q.id];
              
              // We will re-evaluate for PDF consistency based on actual answer data
              const correctIdx = q.correctOptionIndex;
              
              let isActuallyCorrect = false;
              if (userAnswerIdx !== undefined && userAnswerIdx === correctIdx) {
                isActuallyCorrect = true;
              }

              // Use isActuallyCorrect for display label and color in PDF
              const displayScoreLabel = isActuallyCorrect ? 'Correct' : 'Incorrect';
              const displayScoreColor = isActuallyCorrect ? getScoreColor('correct') : getScoreColor('incorrect');
              const displayBoxFillColor = isActuallyCorrect ? [220, 255, 220] : [255, 230, 230];
              // If userAnswerIdx is undefined, it means no answer was selected, 
              // so it can't be correct. It will be covered by 'Incorrect' or specific placeholder.
              // This handles the case where mcScores might be out of sync.

              let userAnswerText = 'Antwoord van student niet geladen'; 
              if (userAnswerIdx !== undefined && q.options && q.options[userAnswerIdx] !== undefined) {
                userAnswerText = q.options[userAnswerIdx];
              } else if (userAnswerIdx === undefined) { // No answer selected by user implies it's incorrect by default for this display logic
                userAnswerText = 'Geen antwoord geselecteerd';
              }

              const correctAnswerText = (correctIdx !== undefined && q.options && q.options[correctIdx] !== undefined) ? q.options[correctIdx] : 'Correct antwoord niet beschikbaar';
              
              const blockWidth = contentWidth * 0.9;
              let tempY = currentY;
              let blockLinesCount = 0; // Using a counter for lines

              const addTextAndCountLines = (text, isBold, customColor, indent = 0) => {
                if (isBold) pdf.setFont(undefined, 'bold');
                if (customColor) pdf.setTextColor(...customColor);
                
                const lines = pdf.splitTextToSize(text, blockWidth - (20 + indent));
                lines.forEach(line => {
                  if (tempY > pageHeight - bottomMargin - lineHeight) { // Check before drawing each line
                     pdf.addPage();
                     currentY = margin;
                     tempY = currentY;
                  }
                  pdf.text(line, margin + 5 + indent, tempY);
                  tempY += lineHeight; // Use consistent lineHeight
                  blockLinesCount++;
                });
                
                if (isBold) pdf.setFont(undefined, 'normal');
                if (customColor) pdf.setTextColor(0,0,0); // Reset color
                return lines.length; // Return number of lines added by this text
              };
              
              let initialTempY = currentY; // Save currentY before calculating block height

              // Simulate drawing to calculate height accurately by summing lines from each part
              let totalLinesForBlock = 0;
              const countLines = (text, indent = 0) => {
                return pdf.splitTextToSize(text, blockWidth - (20 + indent)).length;
              };

              totalLinesForBlock += countLines('Vraag:');
              totalLinesForBlock += countLines(q.questionText || 'Geen vraagtekst', 15);
              totalLinesForBlock += countLines('Resultaat:');
              totalLinesForBlock += countLines(displayScoreLabel, 15); // Use locally determined score label
              totalLinesForBlock += countLines('Jouw antwoord:');
              totalLinesForBlock += countLines(userAnswerText, 15);
              totalLinesForBlock += countLines('Correct antwoord:');
              totalLinesForBlock += countLines(correctAnswerText, 15);

              // Add some padding lines for aesthetics (e.g., before/after each section label)
              const numSections = 4; // Vraag, Resultaat, Jouw Antwoord, Correct Antwoord
              const paddingPerSection = 0.5; // Roughly half a lineheight before/after each section title
              const totalPaddingLines = numSections * 2 * paddingPerSection; 
              
              const calculatedBlockHeight = (totalLinesForBlock + totalPaddingLines) * lineHeight + 20; // Base padding + per-line height

              // Reset tempY for drawing the actual block
              tempY = initialTempY; 

              if (tempY + calculatedBlockHeight > pageHeight - bottomMargin) {
                pdf.addPage();
                currentY = margin;
                tempY = currentY;
              }

              // Block styling based on locally determined correctness
              pdf.setFillColor(...displayBoxFillColor);
              pdf.roundedRect(margin - 5, tempY - 10, blockWidth, calculatedBlockHeight, 6, 6, 'F');
              
              let drawY = tempY;
              const redrawText = (text, isBold, customColor, indent = 0) => {
                if (isBold) pdf.setFont(undefined, 'bold');
                if (customColor) pdf.setTextColor(...customColor);
                const lines = pdf.splitTextToSize(text, blockWidth - (20 + indent));
                lines.forEach(line => {
                   pdf.text(line, margin + 5 + indent, drawY);
                   drawY += lineHeight;
                });
                if (isBold) pdf.setFont(undefined, 'normal');
                if (customColor) pdf.setTextColor(0,0,0);
              };

              redrawText('Vraag:', true);
              drawY += 8; 
              redrawText(q.questionText || 'Geen vraagtekst', false, null, 15);
              drawY += 8; 
              redrawText('Resultaat:', true, displayScoreColor); // Use local display score color
              drawY += 8; 
              redrawText(displayScoreLabel, false, displayScoreColor, 15); // Use local display score label
              drawY += 8; 
              redrawText('Jouw antwoord:', true);
              drawY += 8; 
              redrawText(userAnswerText, false, null, 15);
              drawY += 8; 
              redrawText('Correct antwoord:', true);
              drawY += 8; 
              redrawText(correctAnswerText, false, null, 15);

              currentY = tempY + calculatedBlockHeight + 10;
            });
          }
          currentY += 15; // Increased space between MC type groups (from 10 to 15)
        });
        if (!mcAnyAnsweredOverall && mcQuestions.length > 0) {
            pdf.setFont(undefined, 'normal');
            pdf.setFontSize(12);
            pdf.text('Geen MC vragen beantwoord door de student.', margin, currentY);
            currentY += 20;
        }
        currentY += 10; // Add some space after each appendix section, before the next page or paginumbers
      }
    },
    {
      title: 'Check je Kennis: Resultaten',
      hasData: () => uitlegQuestions && uitlegQuestions.length > 0,
      renderData: () => {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        const answeredUitlegQuestions = uitlegQuestions.filter(q => {
          const answerVersions = uitlegAnswerVersions[q.id] || [];
          return answerVersions.some(a => a.answer && a.answer.trim() !== '');
        });

        if (answeredUitlegQuestions.length === 0 && uitlegQuestions.length > 0) {
          pdf.text('Geen vragen beantwoord voor dit onderdeel.', margin, currentY);
          currentY += 20;
        } else if (uitlegQuestions.length === 0){
           // Already handled by the generic "no data" message
        } else {
          answeredUitlegQuestions.forEach((q, index) => {
            if (currentY > pageHeight - (bottomMargin + 200)) { // Estimate
              pdf.addPage();
              currentY = margin;
            }
            // Titel
            pdf.setFont(undefined, 'bold');
            pdf.setFontSize(13);
            pdf.text(`Vraag ${index + 1}:`, margin, currentY);
            currentY += 18;
            // Vraagtekst
            pdf.setFont('helvetica', 'normal');
            pdf.setFillColor(245, 245, 245);
            const vraagTextNormalized = normalizeText(q.questionText);
            const vraagTextLines = pdf.splitTextToSize(vraagTextNormalized, contentWidth - 20); // Use contentWidth
            const vraagBlockHeight = lineHeight * vraagTextLines.length + 24;
            pdf.roundedRect(margin, currentY - 10, contentWidth, vraagBlockHeight, 6, 6, 'F'); // Use contentWidth
            let yVraag = currentY + (lineHeight / 2); // Adjust for better centering
            vraagTextLines.forEach(line => { pdf.text(line, margin + 10, yVraag); yVraag += lineHeight; });
            currentY += vraagBlockHeight + 10;
            
            // Antwoorden (nieuwste eerst)
            const answerVersions = uitlegAnswerVersions[q.id] || [];
            const reversedVersions = [...answerVersions].reverse(); // Newest first

            reversedVersions.forEach((version, versionIdx) => {
                if (!version.answer || !version.answer.trim()) return;

                if (currentY > pageHeight - (bottomMargin + 100)) { // Rough estimate per answer block
                    pdf.addPage();
                    currentY = margin;
                }

                const isLatest = versionIdx === 0;
                const niveau = (version.score || '').toLowerCase();
                const kleur = niveauColors[niveau] || { bg: [240, 240, 240], text: [0, 0, 0] }; // Default color
                
                const answerTextNormalized = normalizeText(version.answer);
                const answerLines = pdf.splitTextToSize(answerTextNormalized, contentWidth - 20);
                let blockHeight = (lineHeight * answerLines.length) + 24 + (isLatest ? 18 : 0); // Extra space for "Laatste antwoord:"
                if (niveauColors[niveau]) blockHeight += 32; // Space for niveau label

                pdf.setFillColor(...kleur.bg);
                pdf.roundedRect(margin, currentY, contentWidth, blockHeight, 6, 6, 'F');
                
                let yAns = currentY + (lineHeight/2) + 5;

                pdf.setFont(undefined, 'bold');
                pdf.setTextColor(60, 60, 60);
                if (isLatest) {
                    pdf.text('Laatste antwoord:', margin + 10, yAns);
                } else {
                    pdf.text(`Eerdere versie (${new Date(version.timestamp).toLocaleDateString('nl-NL')}):`, margin + 10, yAns);
                }
                yAns += lineHeight + 5;
                
                pdf.setFont(undefined, 'normal');
                pdf.setTextColor(0, 0, 0);
                answerLines.forEach(line => {
                    pdf.text(line, margin + 15, yAns);
                    yAns += lineHeight;
                });
                yAns += 5;

                if (niveauColors[niveau]) {
                     if (yAns + 32 > pageHeight - bottomMargin) { // Check for label space
                        pdf.addPage();
                        currentY = margin;
                        yAns = currentY + (lineHeight/2);
                    }
                    pdf.setFillColor(...kleur.bg);
                    pdf.setTextColor(...kleur.text);
                    pdf.setFont(undefined, 'bold');
                    const scoreText = version.score ? version.score.charAt(0).toUpperCase() + version.score.slice(1) : "Onbekend";
                    const textWidth = pdf.getStringUnitWidth(scoreText) * pdf.getFontSize() / pdf.internal.scaleFactor;
                    const labelWidth = Math.max(80, textWidth + 20);

                    pdf.roundedRect(margin + 10, yAns, labelWidth, 22, 8, 8, 'F');
                    pdf.text(scoreText, margin + 10 + (labelWidth / 2), yAns + 15, { align: 'center' });
                    pdf.setTextColor(0, 0, 0);
                    pdf.setFont(undefined, 'normal');
                    yAns += 22 + 5;
                }
                currentY += blockHeight + 10;
            });
            currentY += 10; // Extra space between questions
          });
        }
        currentY += 15; // Added extra space after the section or message
      }
    },
    {
      title: 'Klinisch Redeneren: Resultaten',
      hasData: () => toepassenCases && toepassenCases.length > 0,
      renderData: () => {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        const answeredToepassenCases = toepassenCases.filter(c => {
          const answerVersions = toepassenAnswerVersions[c.id] || [];
          return answerVersions.some(a => a.answer && a.answer.trim() !== '');
        });

        if (answeredToepassenCases.length === 0 && toepassenCases.length > 0) {
          pdf.text('Geen casussen beantwoord voor dit onderdeel.', margin, currentY);
          currentY += 20;
        } else if (toepassenCases.length === 0) {
          // This case should be covered by the generic 'No data' message of the section loop
          // pdf.text('Geen casussen beschikbaar in deze module.', margin, currentY);
          // currentY += 20;
        } else {
          answeredToepassenCases.forEach((c, index) => {
            if (currentY > pageHeight - (bottomMargin + 250)) { // Initial check for space for a case
              pdf.addPage();
              currentY = margin;
            }
            // Titel
            pdf.setFont(undefined, 'bold');
            pdf.setFontSize(13);
            pdf.text(`${c.title} (Casus ${index + 1} van ${toepassenCases.length}):`, margin, currentY);
            currentY += 18;

            // Casusbeschrijving + Vraag
            pdf.setFont('helvetica', 'normal');
            pdf.setFillColor(245, 245, 245);
            const caseFullText = normalizeText((c.caseDescription || '') + '\n\n' + (c.question || ''));
            const caseLines = pdf.splitTextToSize(caseFullText, contentWidth - 20);
            let caseBlockHeight = lineHeight * caseLines.length + 24;
            
            // Simplified page break logic for case description for now to ensure stability
            if (currentY + caseBlockHeight > pageHeight - bottomMargin) {
                pdf.addPage();
                currentY = margin;
            }
            pdf.roundedRect(margin, currentY - 10, contentWidth, caseBlockHeight, 6, 6, 'F');
            let yCase = currentY + (lineHeight / 2);
            caseLines.forEach(line => {
                if (yCase > pageHeight - bottomMargin - lineHeight) {
                    pdf.addPage();
                    currentY = margin;
                    yCase = currentY + (lineHeight/2);
                    pdf.setFillColor(245, 245, 245); // Reset fill for new page part
                    // Re-draw roundedRect for continuation if it was split - for now, keep simple
                }
                pdf.text(line, margin + 10, yCase);
                yCase += lineHeight;
            });
            currentY += caseBlockHeight + 10;

            // Antwoorden (nieuwste eerst)
            const answerVersions = toepassenAnswerVersions[c.id] || [];
            const reversedVersions = [...answerVersions].reverse();

            reversedVersions.forEach((version, versionIdx) => {
                if (!version.answer || !version.answer.trim()) return;

                if (currentY > pageHeight - (bottomMargin + 150)) { 
                    pdf.addPage();
                    currentY = margin;
                }
                
                const isLatest = versionIdx === 0;
                const niveau = (version.score || '').toLowerCase();
                const kleur = niveauColors[niveau] || { bg: [240, 240, 240], text: [0, 0, 0] };
                
                const answerTextNormalized = normalizeText(version.answer);
                const answerLines = pdf.splitTextToSize(answerTextNormalized, contentWidth - 20);
                let answerBlockHeight = (lineHeight * answerLines.length) + 24 + (isLatest ? 18 : 0);
                if (niveauColors[niveau]) answerBlockHeight += 32;

                if (currentY + answerBlockHeight > pageHeight - bottomMargin) {
                    pdf.addPage();
                    currentY = margin;
                }

                pdf.setFillColor(...kleur.bg);
                pdf.roundedRect(margin, currentY, contentWidth, answerBlockHeight, 6, 6, 'F');
                
                let yAns = currentY + (lineHeight/2) + 5;

                pdf.setFont(undefined, 'bold');
                pdf.setTextColor(60, 60, 60);
                if (isLatest) {
                    pdf.text('Laatste analyse:', margin + 10, yAns);
                } else {
                    pdf.text(`Eerdere versie (${new Date(version.timestamp).toLocaleDateString('nl-NL')}):`, margin + 10, yAns);
                }
                yAns += lineHeight + 5;
                
                pdf.setFont(undefined, 'normal');
                pdf.setTextColor(0, 0, 0);
                
                let lineDrawingY = yAns; // Use a new variable for drawing lines of the answer
                answerLines.forEach(line => {
                     if (lineDrawingY > pageHeight - bottomMargin - lineHeight) {
                        pdf.addPage();
                        currentY = margin;
                        lineDrawingY = currentY + (lineHeight/2); // Reset for new page
                        pdf.setFillColor(...kleur.bg); // Reset fill
                        // Simplified: Not redrawing the full rounded rect for answer splits for now
                    }
                    pdf.text(line, margin + 15, lineDrawingY);
                    lineDrawingY += lineHeight;
                });
                yAns = lineDrawingY + 5; // Update yAns to after the lines

                if (niveauColors[niveau]) {
                     if (yAns + 32 > pageHeight - bottomMargin) { 
                        pdf.addPage();
                        currentY = margin;
                        yAns = currentY + (lineHeight/2);
                    }
                    pdf.setFillColor(...kleur.bg);
                    pdf.setTextColor(...kleur.text);
                    pdf.setFont(undefined, 'bold');
                    const scoreText = version.score ? version.score.charAt(0).toUpperCase() + version.score.slice(1) : "Onbekend";
                    const textWidth = pdf.getStringUnitWidth(scoreText) * pdf.getFontSize() / pdf.internal.scaleFactor;
                    const labelWidth = Math.max(80, textWidth + 20);

                    pdf.roundedRect(margin + 10, yAns, labelWidth, 22, 8, 8, 'F');
                    pdf.text(scoreText, margin + 10 + (labelWidth / 2), yAns + 15, { align: 'center' });
                    pdf.setTextColor(0, 0, 0);
                    pdf.setFont(undefined, 'normal');
                    yAns += 22 + 5;
                }
                currentY += answerBlockHeight + 10; // Increment currentY by the calculated block height
            });
            currentY += 10; 
          });
        } // Closes the main else block for rendering cases
      } // Closes renderData function
    } // Closes the object for Klinisch Redeneren section
  ]; // Closes appendixSections array

  appendixSections.forEach(section => {
    pdf.addPage();
    currentY = margin;
    pagesToNumber.push(pdf.internal.getNumberOfPages());

    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(0,0,0);
    pdf.text(section.title, margin, currentY);
    currentY += 30;

    if (section.hasData()) {
      section.renderData();
    } else {
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.text('Geen gegevens beschikbaar of beantwoord voor dit onderdeel.', margin, currentY);
      currentY += 20;
    }
    currentY += 10; // Add some space after each appendix section, before the next page or paginumbers
  });

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