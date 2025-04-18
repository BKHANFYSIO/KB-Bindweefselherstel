export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function calculateScore(scores) {
  if (!scores || Object.keys(scores).length === 0) return 0;
  
  const totalQuestions = Object.keys(scores).length;
  const correctAnswers = Object.values(scores).filter(score => score === 'correct').length;
  
  return Math.round((correctAnswers / totalQuestions) * 100);
} 