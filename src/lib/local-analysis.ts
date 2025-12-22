export type LocalLiteResult = {
  overallScore: number;
  textClarityScore: number;
  textClarityFeedback: string;
  totalWords?: number;
  estimatedReadingTime?: string;
};

export function simpleLiteAnalysis(text: string | undefined): LocalLiteResult {
  const t = (text || '').trim();
  const words = t ? t.split(/\s+/).filter(Boolean).length : 0;
  const sentences = t ? (t.match(/[.!?]+/g) || []).length || 1 : 1;
  const avgWordsPerSentence = words / Math.max(1, sentences);

  // Heuristic scoring (0-100): shorter sentences and reasonable word counts score higher
  let sentenceScore = Math.max(0, Math.min(100, Math.round(100 - (avgWordsPerSentence - 12) * 4)));
  let lengthPenalty = 0;
  if (words > 2000) lengthPenalty = Math.min(40, Math.round((words - 2000) / 100));
  const totalWords = words;

  const textClarityScore = Math.max(0, sentenceScore - lengthPenalty);
  const overallScore = Math.max(0, Math.round((textClarityScore * 0.8) + 10));

  const estimatedReadingTime = `${Math.max(1, Math.round(words / 200))} minute${Math.max(1, Math.round(words / 200)) > 1 ? 's' : ''}`;

  let feedback = '';
  if (!text || words === 0) feedback = 'No text extracted to analyze.';
  else if (avgWordsPerSentence > 20) feedback = `Sentences are long (avg ${avgWordsPerSentence.toFixed(1)} words); consider splitting.`;
  else feedback = 'Text length and sentence structure look reasonable.';

  return {
    overallScore,
    textClarityScore,
    textClarityFeedback: feedback,
    totalWords,
    estimatedReadingTime,
  };
}
