
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
  // Scores essentiels
  overallScore: z.number().describe('Overall Plain Language Score (0-100).'),
  readabilityGradeLevel: z.string().describe('Readability grade level of the text (e.g., "Grade 8", "B").'),
  
  // Métriques de base
  totalWords: z.number().describe('Total word count of the website content.'),
  totalSentences: z.number().describe('Total sentence count of the website content.'),
  totalParagraphs: z.number().describe('Total paragraph count of the website content.'),
  averageSentenceLength: z.number().describe('Average number of words per sentence.'),
  totalImages: z.number().describe('Total number of images on the website.'),
  totalHeadings: z.number().describe('Total number of headings (H1-H6) on the website.'),
  estimatedReadingTime: z.string().describe('Estimated time to read the content (e.g., "5 minutes").'),
  
  // Scores de clarté
  textClarityScore: z.number().describe('Score for text clarity (0-100).'),
  structureClarityScore: z.number().describe('Score for structural clarity (0-100).'),
  visualClarityScore: z.number().describe('Score for visual clarity (0-100).'),
  
  // Feedbacks simplifiés
  textClarityFeedback: z.string().describe('Brief feedback on text clarity issues.'),
  structureClarityFeedback: z.string().describe('Brief feedback on structural clarity issues.'),
  visualClarityFeedback: z.string().describe('Brief feedback on visual clarity issues.'),
  
  // Scores de lisibilité simplifiés
  fleschReadingEase: z.number().describe('Flesch Reading Ease score.'),
  
  // Analyse vocale simplifiée
  tone: z.string().describe('Detected tone of the content (e.g., "Formal", "Conversational").'),
  passiveVoicePercentage: z.number().optional().describe('Percentage of sentences using passive voice.'),
  
  // Problèmes principaux (tableaux de strings simples)
  mainIssues: z.array(z.string()).describe('List of main issues found in the content.'),
  recommendations: z.array(z.string()).describe('List of actionable recommendations to improve content.'),
  
  // Images
  imagesWithAltText: z.number().optional().describe("Number of images with alt text."),
  imagesWithoutAltText: z.number().optional().describe("Number of images without alt text."),
});
export type PlainLanguageAnalysisOutput = z.infer<typeof PlainLanguageAnalysisOutputSchema>;

export async function analyzePlainLanguage(input: PlainLanguageAnalysisInput): Promise<PlainLanguageAnalysisOutput> {
  return plainLanguageAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'plainLanguageAnalysisPrompt',
  input: {schema: PlainLanguageAnalysisInputSchema},
  output: {schema: PlainLanguageAnalysisOutputSchema},
  prompt: `You are an expert in plain language analysis. Analyze the website content and return a JSON object.

IMPORTANT: Return ONLY valid JSON. All scores must be numbers (not null). All text fields must be strings (not empty).

Required fields with exact types:
{
  "overallScore": <number 0-100>,
  "readabilityGradeLevel": "<string like 'Grade 8' or 'College'>",
  "totalWords": <number>,
  "totalSentences": <number>,
  "totalParagraphs": <number>,
  "averageSentenceLength": <number>,
  "totalImages": <number>,
  "totalHeadings": <number>,
  "estimatedReadingTime": "<string like '5 minutes'>",
  "textClarityScore": <number 0-100>,
  "structureClarityScore": <number 0-100>,
  "visualClarityScore": <number 0-100>,
  "textClarityFeedback": "<string with feedback>",
  "structureClarityFeedback": "<string with feedback>",
  "visualClarityFeedback": "<string with feedback>",
  "fleschReadingEase": <number>,
  "tone": "<string like 'Formal' or 'Conversational'>",
  "mainIssues": ["<string>", "<string>", "<string>"],
  "recommendations": ["<string>", "<string>", "<string>"]
}

CRITICAL: mainIssues and recommendations must be arrays of plain strings, NOT objects.

Example of CORRECT format:
"mainIssues": [
  "Text is too complex for average readers",
  "Missing headings in long paragraphs"
]

Example of WRONG format (DO NOT DO THIS):
"mainIssues": [
  {"description": "Text is too complex"}
]

Website Text Content:
{{{textContent}}}

Website Structure:
{{{structure}}}

Image Metadata:
{{{imageMetadata}}}

Return valid JSON only.
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
