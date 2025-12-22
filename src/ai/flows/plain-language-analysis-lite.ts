'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const PlainLanguageAnalysisLiteInputSchema = z.object({
  textContent: z.string().describe('Short or truncated text content to analyze.'),
  url: z.string().optional(),
});
export type PlainLanguageAnalysisLiteInput = z.infer<typeof PlainLanguageAnalysisLiteInputSchema>;

const PlainLanguageAnalysisLiteOutputSchema = z.object({
  overallScore: z.number().describe('Overall Plain Language Score (0-100).'),
  textClarityScore: z.number().describe('Text clarity score (0-100).'),
  textClarityFeedback: z.string().describe('Short feedback for text clarity.'),
  totalWords: z.number().optional(),
  estimatedReadingTime: z.string().optional(),
});
export type PlainLanguageAnalysisLiteOutput = z.infer<typeof PlainLanguageAnalysisLiteOutputSchema>;

export async function analyzePlainLanguageLite(input: PlainLanguageAnalysisLiteInput): Promise<PlainLanguageAnalysisLiteOutput> {
  return plainLanguageAnalysisLiteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'plainLanguageAnalysisLitePrompt',
  input: { schema: PlainLanguageAnalysisLiteInputSchema },
  output: { schema: PlainLanguageAnalysisLiteOutputSchema },
  prompt: `You are a plain-language evaluator. You will be given a short excerpt of website content. Provide a concise analysis with only these fields in a strict JSON object: overallScore, textClarityScore, textClarityFeedback, totalWords (optional), estimatedReadingTime (optional).

Keep feedback short (1-2 sentences). Scores should be integers 0-100. Return only JSON that matches the schema.`,
});

const plainLanguageAnalysisLiteFlow = ai.defineFlow(
  {
    name: 'plainLanguageAnalysisLiteFlow',
    inputSchema: PlainLanguageAnalysisLiteInputSchema,
    outputSchema: PlainLanguageAnalysisLiteOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
