import type { PlainLanguageAnalysisOutput } from '@/ai/flows/plain-language-analysis';

export function normalizeToFull(analysis: any): PlainLanguageAnalysisOutput {
  const overallScore = typeof analysis?.overallScore === 'number' ? Math.round(analysis.overallScore) : 0;
  const textClarityScore = typeof analysis?.textClarityScore === 'number' ? Math.round(analysis.textClarityScore) : overallScore || 0;
  const structureClarityScore = typeof analysis?.structureClarityScore === 'number' ? Math.round(analysis.structureClarityScore) : textClarityScore || 0;
  const visualClarityScore = typeof analysis?.visualClarityScore === 'number' ? Math.round(analysis.visualClarityScore) : textClarityScore || 0;

  const totalWords = typeof analysis?.totalWords === 'number' ? analysis.totalWords : (analysis?.totalWordsGuess || 0);
  const estimatedReadingTime = analysis?.estimatedReadingTime || `${Math.max(1, Math.round(totalWords / 200))} minute${Math.max(1, Math.round(totalWords / 200)) > 1 ? 's' : ''}`;

  // Minimal safe structure for UI
  const safe: PlainLanguageAnalysisOutput = {
    overallScore,
    readabilityGradeLevel: analysis?.readabilityGradeLevel || 'N/A',
    aiPlagiarismPercentage: typeof analysis?.aiPlagiarismPercentage === 'number' ? analysis.aiPlagiarismPercentage : 0,
    totalWords,
    totalSentences: analysis?.totalSentences || Math.max(1, Math.round(totalWords / 12)),
    totalParagraphs: analysis?.totalParagraphs || 1,
    averageSentenceLength: analysis?.averageSentenceLength || Math.max(1, Math.round(totalWords / Math.max(1, (analysis?.totalSentences || 1)))),
    totalImages: analysis?.totalImages || 0,
    totalHeadings: analysis?.totalHeadings || 0,
    totalLists: analysis?.totalLists || 0,
    estimatedReadingTime,

    textClarityScore,
    structureClarityScore,
    visualClarityScore,
    textClarityFeedback: analysis?.textClarityFeedback || analysis?.textClarity || '',
    structureClarityFeedback: analysis?.structureClarityFeedback || '',
    visualClarityFeedback: analysis?.visualClarityFeedback || '',

    nonNativeReadability: analysis?.nonNativeReadability || { score: 50, feedback: 'Not evaluated' },

    readabilityScores: analysis?.readabilityScores || { fleschReadingEase: 0, fleschKincaidGrade: 0, gunningFogIndex: 0 },

    voiceAndTone: analysis?.voiceAndTone || {
      passiveVoicePercentage: 0,
      activeVoicePercentage: 0,
      tone: 'Unknown',
      toneConfidence: 0,
      toneConsistency: 0,
      toneConsistencyFeedback: '',
    },

    sentenceAnalysis: analysis?.sentenceAnalysis || { longSentenceCount: 0, complexWordCount: 0 },

    vocabulary: analysis?.vocabulary || { jargon: [], acronyms: [], repetitiveWords: [] },

    integrity: analysis?.integrity || {
      aiGeneratedContentPercentage: 0,
      plagiarismPercentage: 0,
      biasAndInclusivityWarnings: [],
      internalRedundancy: [],
    },

    structuralAnalysis: analysis?.structuralAnalysis || {
      headings: { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] },
      headingHierarchyIssues: [],
      listAndBulletIssues: [],
    },

    scannability: analysis?.scannability || {
      textWalls: [],
      paragraphLengthScore: 100,
      logicalFlowFeedback: '',
      headingContentMismatch: [],
    },

    visualAnalysis: analysis?.visualAnalysis || {
      imagesWithAltText: 0,
      imagesWithoutAltText: 0,
      ambiguousIcons: [],
      ambiguousLinkText: [],
    },

    layoutAndDesign: analysis?.layoutAndDesign || { hasMobileViewport: true, viewportTagFeedback: '' },

    plainLanguagePrinciples: analysis?.plainLanguagePrinciples || [],
  };

  return safe;
}
