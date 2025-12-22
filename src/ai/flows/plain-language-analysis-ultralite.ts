'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const PlainLanguageAnalysisUltraLiteInputSchema = z.object({
  excerpt: z.string().describe('Very short excerpt (first ~200 chars) to analyze.'),
  url: z.string().optional(),
});
export type PlainLanguageAnalysisUltraLiteInput = z.infer<typeof PlainLanguageAnalysisUltraLiteInputSchema>;

const PlainLanguageAnalysisUltraLiteOutputSchema = z.object({
  overallScore: z.number().describe('Overall score (0-100 integer).'),
  shortFeedback: z.string().describe('One short sentence.'),
});
export type PlainLanguageAnalysisUltraLiteOutput = z.infer<typeof PlainLanguageAnalysisUltraLiteOutputSchema>;

export async function analyzePlainLanguageUltraLite(input: PlainLanguageAnalysisUltraLiteInput): Promise<PlainLanguageAnalysisUltraLiteOutput> {
  return plainLanguageAnalysisUltraLiteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'plainLanguageAnalysisUltraLitePrompt',
  input: { schema: PlainLanguageAnalysisUltraLiteInputSchema },
  output: { schema: PlainLanguageAnalysisUltraLiteOutputSchema },
  prompt: `You are a plain-language evaluator. Given a very short excerpt (under 250 characters), return a minimal JSON object with two fields: overallScore (0-100 integer) and shortFeedback (one short sentence). Only return JSON. Be extremely brief and conservative.`,
});

const plainLanguageAnalysisUltraLiteFlow = ai.defineFlow(
  {
    name: 'plainLanguageAnalysisUltraLiteFlow',
    inputSchema: PlainLanguageAnalysisUltraLiteInputSchema,
    outputSchema: PlainLanguageAnalysisUltraLiteOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
