'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const PlainLanguageAnalysisSuperLiteInputSchema = z.object({
  textContent: z.string().describe('Short or truncated text content to analyze.'),
  url: z.string().optional(),
});
export type PlainLanguageAnalysisSuperLiteInput = z.infer<typeof PlainLanguageAnalysisSuperLiteInputSchema>;

const PlainLanguageAnalysisSuperLiteOutputSchema = z.object({
  overallScore: z.number().describe('Overall Plain Language Score (0-100).'),
  shortFeedback: z.string().describe('One-line summary feedback.'),
});
export type PlainLanguageAnalysisSuperLiteOutput = z.infer<typeof PlainLanguageAnalysisSuperLiteOutputSchema>;

export async function analyzePlainLanguageSuperLite(input: PlainLanguageAnalysisSuperLiteInput): Promise<PlainLanguageAnalysisSuperLiteOutput> {
  return plainLanguageAnalysisSuperLiteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'plainLanguageAnalysisSuperLitePrompt',
  input: { schema: PlainLanguageAnalysisSuperLiteInputSchema },
  output: { schema: PlainLanguageAnalysisSuperLiteOutputSchema },
  prompt: `You are a plain-language evaluator. You will be given a short excerpt of website content and a URL.
Return a strict JSON object with only two fields: overallScore (0-100 integer) and shortFeedback (1 short sentence). Keep it extremely brief and only return JSON.`,
});

const plainLanguageAnalysisSuperLiteFlow = ai.defineFlow(
  {
    name: 'plainLanguageAnalysisSuperLiteFlow',
    inputSchema: PlainLanguageAnalysisSuperLiteInputSchema,
    outputSchema: PlainLanguageAnalysisSuperLiteOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
