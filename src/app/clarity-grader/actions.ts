'use server';

import { analyzePlainLanguage, PlainLanguageAnalysisInput, PlainLanguageAnalysisOutput } from '@/ai/flows/plain-language-analysis';
import { analyzePlainLanguageLite } from '@/ai/flows/plain-language-analysis-lite';
import { analyzePlainLanguageSuperLite } from '@/ai/flows/plain-language-analysis-superlite';
import { analyzePlainLanguageUltraLite } from '@/ai/flows/plain-language-analysis-ultralite';
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

    // Determine analysis mode (ULTRALITE > SUPERLITE > LITE > FULL)
    const forceUltra = process.env.ULTRALITE_ANALYSIS === 'true' || (data as any)?.ultralite === true;
    const forceSuperlite = !forceUltra && (process.env.SUPERLITE_ANALYSIS === 'true' || (data as any)?.superlite === true);
    const useLite = !forceUltra && !forceSuperlite && process.env.LITE_ANALYSIS === 'true';
    const maxChars = parseInt(process.env.LITE_MAX_CHARS || '4000', 10);
    const truncatedText = scraped.textContent && scraped.textContent.length > maxChars
      ? `${scraped.textContent.slice(0, maxChars)}\n\n[...truncated]`
      : scraped.textContent;

    if (forceUltra) {
      // Ultralite: very short excerpt, very small time budget. Guaranteed fast or fallback.
      const excerpt = (scraped.textContent || '').slice(0, 200);
      const input = { excerpt, url: validatedFields.data.url };
      const aiTimeout = parseInt(process.env.AI_TIMEOUT_ULTRALITE_MS || '5000', 10);
      const aiTimeoutExtended = parseInt(process.env.AI_TIMEOUT_ULTRALITE_EXTENDED_MS || '10000', 10);
      let raw: any;

      // Try quick ultralite, then an extended attempt. Fall back immediately to local heuristic if both fail.
      try {
        raw = await withTimeout(analyzePlainLanguageUltraLite(input), aiTimeout);
      } catch (err) {
        console.warn(`Ultralite timed out after ${aiTimeout}ms; retrying with extended timeout ${aiTimeoutExtended}ms.`, err?.message || err);
        try {
          raw = await withTimeout(analyzePlainLanguageUltraLite(input), aiTimeoutExtended);
        } catch (err2) {
          console.error('Ultralite analysis failed after retry:', err2);
          const { simpleLiteAnalysis } = await import('@/lib/local-analysis');
          const fallback = simpleLiteAnalysis(excerpt);
          const { normalizeToFull } = await import('@/lib/normalize-analysis');
          return { message: `Instant analysis timed out; returning local heuristic: ${err2 instanceof Error ? err2.message : String(err2)}`, analysis: normalizeToFull(fallback) };
        }
      }

      const { normalizeToFull } = await import('@/lib/normalize-analysis');
      const normalized = normalizeToFull({ overallScore: raw.overallScore, textClarityFeedback: raw.shortFeedback, totalWords: (excerpt || '').split(/\s+/).filter(Boolean).length });
      return { message: 'Instant analysis complete.', analysis: normalized };
    }

    if (forceSuperlite) {
      const input = { textContent: truncatedText, url: validatedFields.data.url };
      const aiTimeout = parseInt(process.env.AI_TIMEOUT_SUPERLITE_MS || '30000', 10);
      const aiTimeoutExtended = parseInt(process.env.AI_TIMEOUT_SUPERLITE_EXTENDED_MS || '90000', 10);
      let raw: any;

      // Try a short super-lite timeout, then retry with an extended timeout before falling back.
      try {
        raw = await withTimeout(analyzePlainLanguageSuperLite(input), aiTimeout);
      } catch (err) {
        console.warn(`Super-lite timed out after ${aiTimeout}ms; retrying with extended timeout ${aiTimeoutExtended}ms.`, err?.message || err);
        try {
          raw = await withTimeout(analyzePlainLanguageSuperLite(input), aiTimeoutExtended);
        } catch (err2) {
          console.error('Super-lite analysis failed after retry:', err2);
          const { simpleLiteAnalysis } = await import('@/lib/local-analysis');
          const fallback = simpleLiteAnalysis(truncatedText);
          const { normalizeToFull } = await import('@/lib/normalize-analysis');
          return { message: `Super-lite analysis timed out or failed after retry; returning local heuristic: ${err2 instanceof Error ? err2.message : String(err2)}`, analysis: normalizeToFull(fallback) };
        }
      }

      // Normalize the (possibly small) AI response to the full shape for the UI
      const { normalizeToFull } = await import('@/lib/normalize-analysis');
      const normalized = normalizeToFull({ overallScore: raw.overallScore, textClarityFeedback: raw.shortFeedback, totalWords: (truncatedText || '').split(/\s+/).filter(Boolean).length });
      return { message: 'Super-lite analysis complete.', analysis: normalized };
    }

    if (useLite) {
      const input = { textContent: truncatedText, url: validatedFields.data.url };
      const aiTimeout = parseInt(process.env.AI_TIMEOUT_LITE_MS || process.env.AI_TIMEOUT_MS || '60000', 10);
      const aiTimeoutExtended = parseInt(process.env.AI_TIMEOUT_LITE_EXTENDED_MS || '180000', 10);
      let analysis: any;

      // First attempt: normal lite timeout
      try {
        analysis = await withTimeout(analyzePlainLanguageLite(input), aiTimeout);
      } catch (err) {
        console.warn(`Lite analysis timed out after ${aiTimeout}ms; retrying with extended timeout ${aiTimeoutExtended}ms.`, err?.message || err);
        // Second attempt: extended timeout
        try {
          analysis = await withTimeout(analyzePlainLanguageLite(input), aiTimeoutExtended);
        } catch (err2) {
          console.error('Lite analysis error after retry:', err2);
          // Fallback: return a quick, local heuristic so the UI gets something immediately
          const { simpleLiteAnalysis } = await import('@/lib/local-analysis');
          const fallback = simpleLiteAnalysis(input.textContent);
          return { message: `Lite analysis timed out or failed after retry; returning local heuristic: ${err2 instanceof Error ? err2.message : String(err2)}`, analysis: fallback };
        }
      }

      if (!analysis) {
        const { simpleLiteAnalysis } = await import('@/lib/local-analysis');
        const fallback = simpleLiteAnalysis(input.textContent);
        const { normalizeToFull } = await import('@/lib/normalize-analysis');
        return { message: 'Lite analysis failed. Returning local heuristic.', analysis: normalizeToFull(fallback) };
      }

      // If we got a lite analysis (from AI), normalize shape for UI
      const { normalizeToFull } = await import('@/lib/normalize-analysis');
      const normalized = normalizeToFull(analysis);
      return { message: 'Lite analysis complete.', analysis: normalized };
    }

    // Full analysis path (truncate long text to keep prompts reasonable)
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
