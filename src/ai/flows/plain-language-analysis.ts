
'use server';

/**
 * @fileOverview Analyzes website content for plain language standards.
 *
 * - analyzePlainLanguage - Analyzes website content and returns a plain language report.
 * - PlainLanguageAnalysisInput - The input type for the analyzePlainlanguage function.
 * - PlainLanguageAnalysisOutput - The return type for the analyzePlainlanguage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const PlainLanguageAnalysisInputSchema = z.object({
  textContent: z.string().describe('The visible text content of the website.'),
  structure: z.string().describe('JSON string containing the heading structure, lists, and paragraphs.'),
  imageMetadata: z.string().describe('JSON string containing image alt text and metadata.'),
});
export type PlainLanguageAnalysisInput = z.infer<typeof PlainLanguageAnalysisInputSchema>;

const PlainLanguageAnalysisOutputSchema = z.object({
  overallScore: z.number().describe('Overall Plain Language Score (0-100).'),
  readabilityGradeLevel: z.string().describe('Readability grade level of the text (e.g., "Grade 8", "B").'),
  aiPlagiarismPercentage: z.number().describe('Estimated percentage of AI-generated or plagiarized content.'),
  totalWords: z.number().describe('Total word count of the website content.'),
  totalSentences: z.number().describe('Total sentence count of the website content.'),
  totalParagraphs: z.number().describe('Total paragraph count of the website content.'),
  averageSentenceLength: z.number().describe('Average number of words per sentence.'),
  totalImages: z.number().describe('Total number of images on the website.'),
  totalHeadings: z.number().describe('Total number of headings (H1-H6) on the website.'),
  totalLists: z.number().describe('Total number of lists (ordered and unordered) on the website.'),
  estimatedReadingTime: z.string().describe('Estimated time to read the content (e.g., "5 minutes").'),
  textClarityScore: z.number().describe('Score for text clarity.'),
  structureClarityScore: z.number().describe('Score for structural clarity.'),
  visualClarityScore: z.number().describe('Score for visual clarity.'),
  textClarityFeedback: z.string().describe('Feedback on text clarity, including highlighted issues and recommendations.'),
  structureClarityFeedback: z.string().describe('Feedback on structural clarity, including highlighted issues and recommendations.'),
  visualClarityFeedback: z.string().describe('Feedback on visual clarity, including highlighted issues and recommendations.'),
  nonNativeReadability: z.object({
    score: z.number().describe('A score from 0-100 indicating readability for non-native speakers (higher is better).'),
    feedback: z.string().describe('Specific feedback on what makes the text difficult for non-native speakers.'),
  }),
  readabilityScores: z.object({
    fleschReadingEase: z.number().describe('Flesch Reading Ease score.'),
    fleschKincaidGrade: z.number().describe('Flesch-Kincaid Grade Level.'),
    gunningFogIndex: z.number().describe('Gunning Fog Index.'),
  }),
  voiceAndTone: z.object({
    passiveVoicePercentage: z.number().describe('Percentage of sentences using passive voice.'),
    activeVoicePercentage: z.number().describe('Percentage of sentences using active voice.'),
    tone: z.string().describe('Detected tone of the content (e.g., "Formal", "Conversational").'),
    toneConfidence: z.number().describe("The AI's confidence in the detected tone, from 0 to 100."),
    toneConsistency: z.number().describe("A score from 0-100 indicating how consistent the tone is across the document."),
    toneConsistencyFeedback: z.string().describe("A brief explanation of the tone's consistency, e.g., 'Tone is consistent across paragraphs (minor variation detected)'.")
  }),
  sentenceAnalysis: z.object({
    longSentenceCount: z.number().describe('Number of sentences with more than 20 words.'),
    complexWordCount: z.number().describe('Number of words with 3 or more syllables.'),
  }),
  vocabulary: z.object({
    jargon: z.array(z.object({ word: z.string(), suggestion: z.string().describe("A simpler alternative or short explanation for the jargon word.")})).describe('List of detected jargon or technical terms with suggestions.'),
    acronyms: z.array(z.string()).describe('List of detected acronyms.'),
    repetitiveWords: z.array(z.string()).describe('List of words that are frequently repeated.'),
  }),
  integrity: z.object({
    aiGeneratedContentPercentage: z.number().describe('Likelihood percentage of content being AI-generated.'),
    plagiarismPercentage: z.number().describe('Percentage of content that matches public web sources.'),
    biasAndInclusivityWarnings: z.array(z.string()).describe('List of warnings for potentially biased or non-inclusive language.'),
    internalRedundancy: z.array(z.string()).describe('List of content snippets found to be duplicated or semantically redundant within the site.'),
  }),
  structuralAnalysis: z.object({
      headings: z.object({
        h1: z.array(z.string()).describe("List of H1 heading texts."),
        h2: z.array(z.string()).describe("List of H2 heading texts."),
        h3: z.array(z.string()).describe("List of H3 heading texts."),
        h4: z.array(z.string()).describe("List of H4 heading texts."),
        h5: z.array(z.string()).describe("List of H5 heading texts."),
        h6: z.array(z.string()).describe("List of H6 heading texts."),
      }).describe("The text content of all headings found on the page."),
      headingHierarchyIssues: z.array(z.string()).describe("List of detected heading hierarchy issues (e.g., skipped levels)."),
      listAndBulletIssues: z.array(z.string()).describe("List of issues related to lists, like long paragraphs that should be bullet points."),
  }).describe("Detailed analysis of the page's HTML structure."),
  scannability: z.object({
    textWalls: z.array(z.object({
      text: z.string().describe("The full text of the paragraph that is too long."),
      summary: z.string().describe("A one-sentence summary of the paragraph's content.")
    })).describe("List of paragraphs that are too long (e.g., > 150 words) and should be broken up."),
    paragraphLengthScore: z.number().describe("Score from 0-100 based on average paragraph length. Higher is better (shorter paragraphs)."),
    logicalFlowFeedback: z.string().describe("Feedback on whether the content's key message is clear, if headings match their content, and if the overall progression makes sense from a user's perspective."),
    headingContentMismatch: z.array(z.string()).describe("List of headings where the content below does not appear to match the heading's topic, with a brief explanation."),
  }).describe("Analysis of how easily a user can scan and understand the content."),
   visualAnalysis: z.object({
    imagesWithAltText: z.number().describe("Number of images found with non-empty alt-text."),
    imagesWithoutAltText: z.number().describe("Number of images found with missing or empty alt-text."),
    ambiguousIcons: z.array(z.string()).describe("List of icons or pictograms that may be ambiguous or lack clear text labels (e.g., an 'i' icon without the word 'Info')."),
    ambiguousLinkText: z.array(z.string()).describe("List of anchor texts for links or buttons that are ambiguous (e.g., 'Click Here', 'Read More')."),
  }).describe("Detailed analysis of visual elements on the page for clarity and accessibility."),
  layoutAndDesign: z.object({
    hasMobileViewport: z.boolean().describe("Whether a mobile viewport meta tag was found."),
    viewportTagFeedback: z.string().describe("Feedback on the mobile viewport tag implementation, if any issues are found. Include the meta tag itself in a code block."),
  }).describe("Analysis of the page's layout and design for responsiveness."),
  plainLanguagePrinciples: z.array(z.object({
    name: z.string().describe("The name of the plain language principle being evaluated."),
    isMet: z.boolean().describe("Whether the content meets the principle."),
    reasoning: z.string().describe("A brief, one-sentence explanation of why the principle is met or not met."),
  })).describe("An evaluation of the content against 14 core plain language principles."),
});
export type PlainLanguageAnalysisOutput = z.infer<typeof PlainLanguageAnalysisOutputSchema>;

export async function analyzePlainLanguage(input: PlainLanguageAnalysisInput): Promise<PlainLanguageAnalysisOutput> {
  return plainLanguageAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'plainLanguageAnalysisPrompt',
  input: {schema: PlainLanguageAnalysisInputSchema},
  output: {schema: PlainLanguageAnalysisOutputSchema},
  prompt: `You are an expert in plain language standards, content accessibility, and linguistic analysis. You will be given a URL. You must act as a web scraper, fetch the content of the URL, and perform a detailed analysis.

  Analyze the fetched website content based on a comprehensive set of plain language principles. You must provide scores, detailed metrics, and feedback.

  For the 'nonNativeReadability' score, specifically evaluate sentence complexity and vocabulary choice from the perspective of a non-native English speaker. A score of 100 means it's very easy to understand, while 0 is impossible. Provide targeted feedback.

  For the 'voiceAndTone' section, analyze the text to determine the primary tone. Then, provide a 'toneConfidence' score (0-100) for your assessment. Also, analyze if the tone is consistent across the entire document and provide a 'toneConsistency' score (0-100, where 100 is perfectly consistent). Finally, provide a brief 'toneConsistencyFeedback' summary, such as 'Tone is consistent across all sections' or 'Tone shifts from formal in the introduction to conversational in the FAQ section.'

  For the 'vocabulary' section, identify jargon, acronyms, and repetitive words. For each jargon word detected, provide a simpler alternative or a brief explanation.

  For the 'integrity' section, perform the following checks:
  - 'aiGeneratedContentPercentage': Estimate the likelihood that the content was written by an AI.
  - 'plagiarismPercentage': Estimate the percentage of content that matches public web sources.
  - 'biasAndInclusivityWarnings': Flag any gendered, exclusionary, or otherwise non-inclusive language.
  - 'internalRedundancy': Identify any sentences or phrases that are repeated verbatim, near-verbatim, or are semantically very similar within the provided text.
  
  For the 'structuralAnalysis' section:
  - 'headings': Extract the text content for each heading level (H1 through H6) and list them.
  - 'headingHierarchyIssues': Identify any issues with the heading hierarchy, such as skipping levels (e.g., an H1 followed by an H3).
  - 'listAndBulletIssues': Detect long paragraphs that would be more readable as a bulleted or numbered list.

  For the 'scannability' section:
  - 'textWalls': Review the 'paragraphs' list in the 'Website Structure' JSON. Identify paragraphs that are significantly long (e.g., more than 80 words) and qualify as "walls of text." For each one, provide the full text of the paragraph and a concise, one-sentence summary of its content.
  - 'paragraphLengthScore': Provide a score from 0-100 where higher scores indicate shorter, more scannable paragraphs on average. This will serve as the main 'scannability score'.
  - 'logicalFlowFeedback': Analyze the overall structure and provide feedback on how logically the content flows from one section to the next. Specifically, answer: Is the page's key message clear and easy to identify? Does the order of topics make sense for a typical reader?
  - 'headingContentMismatch': Critically evaluate if the content under each heading accurately matches the heading's topic. If a heading is misleading or the content seems unrelated, add a descriptive string to this array. For example: "The heading 'Our Services' is followed by content about company history, which is a mismatch."
  
  For the 'visualAnalysis' section, inspect the page's images and icons:
  - Count the total number of '<img>' tags. Differentiate between those with a non-empty 'alt' attribute ('imagesWithAltText') and those with a missing or empty 'alt' attribute ('imagesWithoutAltText').
  - Identify icons or pictograms (often '<i>', '<span>' or '<svg>' tags) used without accompanying text labels that clarify their function. List any that could be ambiguous (e.g., a gear icon without the word "Settings").
  - Inspect all '<a>' and '<button>' elements and identify any with generic, non-descriptive text like "Click Here", "Learn More", "Read More", "Go", "Submit", etc. List these under 'ambiguousLinkText'.
  
  For the 'layoutAndDesign' section, inspect the page's HTML '<head>':
  - Check for the presence of a '<meta name="viewport" content="width=device-width, initial-scale=1">'.
  - If the tag is present, set 'hasMobileViewport' to true and provide feedback. Use markdown for the code snippet, like so: "The page includes a \`'<meta name="viewport" content="width=device-width, initial-scale=1">'\` tag, ensuring proper responsiveness across various device sizes.".
  - If it is missing or incorrect, set 'hasMobileViewport' to false and provide feedback explaining why it's important and what the correct tag should be.

  For the 'plainLanguagePrinciples' section, evaluate the site against the following 14 criteria. For each, you must set 'isMet' to true or false and provide a brief explanation in 'reasoning'. **If a principle is NOT met, the reasoning must be detailed, explaining what is missing and providing an example or suggestion for improvement.**
  1.  **Audience Defined**: Readers are clearly identified, including their skills, background, and language needs.
  2.  **Purpose Clear**: The document clearly supports what readers want to do (e.g., decide, act, learn).
  3.  **Context Considered**: Reading conditions (time, setting, device, emotion) are taken into account.
  4.  **Content Relevant**: Only necessary, accurate, and useful information is included; unnecessary detail is removed.
  5.  **Appropriate Format**: The chosen document type (or medium) fits readers’ needs and context.
  6.  **Logical Structure**: Information is grouped and ordered logically; key points appear early.
  7.  **Effective Headings**: Headings accurately describe sections and help readers scan.
  8.  **Reader-Friendly Layout**: Design elements (spacing, typography, lists, visuals) make information easy to locate.
  9.  **Supplementary Info Separated**: Less-important or legal content is clearly separated (e.g., appendix, footnote).
  10. **Familiar Words**: Vocabulary is familiar, concrete, and culturally appropriate; jargon is defined or avoided.
  11. **Clear Sentences**: Sentences use plain structure, active voice, and correct grammar/punctuation.
  12. **Concise Expression**: Each sentence and paragraph focuses on one idea, with no redundant words.
  13. **Supportive Visuals**: Images or multimedia aid understanding and are placed near related text.
  14. **Respectful Tone & Cohesion**: Tone is inclusive and respectful; the document reads smoothly and consistently.

  Set the 'totalImages' field to the sum of images with and without alt text.

  Website Text Content:
  {{{textContent}}}

  Website Structure (Headings, Lists, & Paragraphs):
  {{{structure}}}

  Image Metadata:
  {{{imageMetadata}}}

  Your output must be a JSON object that adheres strictly to the defined schema.
  `,
});

const plainLanguageAnalysisFlow = ai.defineFlow(
  {
    name: 'plainLanguageAnalysisFlow',
    inputSchema: PlainLanguageAnalysisInputSchema,
    outputSchema: PlainLanguageAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
