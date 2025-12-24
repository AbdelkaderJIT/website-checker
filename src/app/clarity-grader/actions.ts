'use server';

import { analyzePlainLanguage, PlainLanguageAnalysisInput, PlainLanguageAnalysisOutput } from '@/ai/flows/plain-language-analysis';
import { scrapePage } from '@/server/scraper';
import { z } from 'zod';

// Utility to timebox promises
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('AI analysis timed out')), ms);
    p.then(r => {
      clearTimeout(t);
      resolve(r);
    }, e => {
      clearTimeout(t);
      reject(e);
    });
  });
}

const FormSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
});

export type AnalysisState = {
  analysis?: PlainLanguageAnalysisOutput | any;
  message: string;
};

export async function getClarityAnalysis(data: { url: string }): Promise<AnalysisState> {
  const validatedFields = FormSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.url?.join(' ') || "Invalid URL provided.",
    };
  }

  try {
    // Perform server-side scraping/extraction and pass concrete content to the AI.
    const scraped = await scrapePage(validatedFields.data.url);

    // Full analysis path (truncate long text to keep prompts reasonable)
    const maxChars = parseInt(process.env.LITE_MAX_CHARS || '4000', 10);
    const truncatedText = scraped.textContent && scraped.textContent.length > maxChars
      ? `${scraped.textContent.slice(0, maxChars)}\n\n[...truncated]`
      : scraped.textContent;

    const analysisInput: PlainLanguageAnalysisInput = {
      textContent: truncatedText,
      structure: scraped.structure,
      imageMetadata: scraped.imageMetadata,
    };

    const aiTimeout = parseInt(process.env.AI_TIMEOUT_FULL_MS || process.env.AI_TIMEOUT_MS || '300000', 10);
    let analysis: PlainLanguageAnalysisOutput | undefined;
    try {
      analysis = await withTimeout(analyzePlainLanguage(analysisInput), aiTimeout);
    } catch (err) {
      console.error('Full analysis error:', err);
      return { message: `Analysis failed: ${err instanceof Error ? err.message : String(err)}` };
    }

    if (!analysis) {
        return { message: 'Analysis failed. The AI model did not return a result.' };
    }

    return { message: 'Analysis complete.', analysis };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { message: `An unexpected error occurred during analysis: ${errorMessage}` };
  }
}
