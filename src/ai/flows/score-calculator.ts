// src/ai/flows/score-calculator.ts
'use server';
/**
 * @fileOverview A flow to calculate scores for plain language categories using AI, based on provided rubrics.
 *
 * - calculateScores - A function that calculates plain language scores.
 * - CalculateScoresInput - The input type for the calculateScores function.
 * - CalculateScoresOutput - The return type for the calculateScores function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateScoresInputSchema = z.object({
  textClarity: z.string().describe('The text clarity analysis from website.'),
  structuralClarity: z.string().describe('The structural clarity analysis from website.'),
  visualClarity: z.string().describe('The visual clarity analysis from website.'),
});

export type CalculateScoresInput = z.infer<typeof CalculateScoresInputSchema>;

const CalculateScoresOutputSchema = z.object({
  textClarityScore: z.number().describe('The score for text clarity (0-100).'),
  structuralClarityScore: z.number().describe('The score for structural clarity (0-100).'),
  visualClarityScore: z.number().describe('The score for visual clarity (0-100).'),
  overallScore: z.number().describe('The overall plain language score (0-100).'),
});

export type CalculateScoresOutput = z.infer<typeof CalculateScoresOutputSchema>;

export async function calculateScores(input: CalculateScoresInput): Promise<CalculateScoresOutput> {
  return calculateScoresFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateScoresPrompt',
  input: {schema: CalculateScoresInputSchema},
  output: {schema: CalculateScoresOutputSchema},
  prompt: `You are an AI assistant specialized in evaluating website content based on plain language principles.\n\nYou will receive analysis for Text Clarity, Structural Clarity, and Visual Clarity, and you should output scores (0-100) for each, as well as an overall score.\n\nScoring Rubric:\n* 90-100: Excellent. Content is exceptionally clear, concise, and easy to understand.\n* 80-89: Good. Content is generally clear and well-organized, with minor areas for improvement.\n* 70-79: Fair. Content is understandable but may require some effort from the reader. Some improvements needed.\n* 60-69: Poor. Content is difficult to understand and requires significant effort. Major improvements needed.\n* Below 60: Failing. Content is incomprehensible and fails to meet plain language standards.\n\nConsider the following analysis when determining scores:\n\nText Clarity: {{{textClarity}}}\n\nStructural Clarity: {{{structuralClarity}}}\n\nVisual Clarity: {{{visualClarity}}}\n\nProvide scores based on the analysis. The 'overallScore' must be a weighted average of the three scores, where Text Clarity accounts for 50%, and Structural and Visual Clarity each account for 25%.
`,
});

const calculateScoresFlow = ai.defineFlow(
  {
    name: 'calculateScoresFlow',
    inputSchema: CalculateScoresInputSchema,
    outputSchema: CalculateScoresOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
