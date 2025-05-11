export function calculateScore(scores) {
  if (!scores || Object.keys(scores).length === 0) return 0;
  
  const totalQuestions = Object.keys(scores).length;
  const correctAnswers = Object.values(scores).filter(score => score === 'correct').length;
  
  return Math.round((correctAnswers / totalQuestions) * 100);
} 