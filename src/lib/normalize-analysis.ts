import type { PlainLanguageAnalysisOutput } from '@/ai/flows/plain-language-analysis';

export function normalizeToFull(analysis: any): PlainLanguageAnalysisOutput {
  const overallScore = typeof analysis?.overallScore === 'number' ? Math.round(analysis.overallScore) : 0;
  const textClarityScore = typeof analysis?.textClarityScore === 'number' ? Math.round(analysis.textClarityScore) : overallScore || 0;
  const structureClarityScore = typeof analysis?.structureClarityScore === 'number' ? Math.round(analysis.structureClarityScore) : textClarityScore || 0;
  const visualClarityScore = typeof analysis?.visualClarityScore === 'number' ? Math.round(analysis.visualClarityScore) : textClarityScore || 0;

  const totalWords = typeof analysis?.totalWords === 'number' ? analysis.totalWords : (analysis?.totalWordsGuess || 0);
  const estimatedReadingTime = analysis?.estimatedReadingTime || `${Math.max(1, Math.round(totalWords / 200))} minute${Math.max(1, Math.round(totalWords / 200)) > 1 ? 's' : ''}`;

  // Structure simplifiée pour le nouveau schéma
  const safe: PlainLanguageAnalysisOutput = {
    // Scores essentiels
    overallScore,
    readabilityGradeLevel: analysis?.readabilityGradeLevel || 'N/A',
    
    // Métriques de base
    totalWords,
    totalSentences: analysis?.totalSentences || Math.max(1, Math.round(totalWords / 12)),
    totalParagraphs: analysis?.totalParagraphs || 1,
    averageSentenceLength: analysis?.averageSentenceLength || Math.max(1, Math.round(totalWords / Math.max(1, (analysis?.totalSentences || 1)))),
    totalImages: analysis?.totalImages || 0,
    totalHeadings: analysis?.totalHeadings || 0,
    estimatedReadingTime,

    // Scores de clarté
    textClarityScore,
    structureClarityScore,
    visualClarityScore,
    
    // Feedbacks
    textClarityFeedback: analysis?.textClarityFeedback || analysis?.textClarity || 'No issues detected.',
    structureClarityFeedback: analysis?.structureClarityFeedback || 'No issues detected.',
    visualClarityFeedback: analysis?.visualClarityFeedback || 'No issues detected.',
    
    // Score de lisibilité
    fleschReadingEase: analysis?.fleschReadingEase || analysis?.readabilityScores?.fleschReadingEase || 50,
    
    // Tone
    tone: analysis?.tone || analysis?.voiceAndTone?.tone || 'Unknown',
    passiveVoicePercentage: analysis?.passiveVoicePercentage || analysis?.voiceAndTone?.passiveVoicePercentage,
    
    // Listes simplifiées
    mainIssues: analysis?.mainIssues || [],
    recommendations: analysis?.recommendations || [],
    
    // Images
    imagesWithAltText: analysis?.imagesWithAltText || analysis?.visualAnalysis?.imagesWithAltText,
    imagesWithoutAltText: analysis?.imagesWithoutAltText || analysis?.visualAnalysis?.imagesWithoutAltText,
  };

  return safe;
}
