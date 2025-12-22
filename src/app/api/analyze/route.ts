import { NextResponse } from 'next/server';
import { getClarityAnalysis } from '@/app/clarity-grader/actions';
import { scrapePage } from '@/server/scraper';
import { analyzePlainLanguageLite } from '@/ai/flows/plain-language-analysis-lite';

function timeoutPromise<T>(p: Promise<T>, ms = 30000): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('Timed out')), ms);
    p.then(r => {
      clearTimeout(t);
      resolve(r);
    }, e => {
      clearTimeout(t);
      reject(e);
    });
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = body?.url;
    if (!url) return NextResponse.json({ ok: false, error: 'Missing url field' }, { status: 400 });

    // First, perform a quick HTTP scrape so we can return scraped data even if the AI is slow
    const scraped = await scrapePage(url);

    try {
// Allow forcing an ultralite, super-lite or lite analysis directly for quick tests
    if (body?.ultralite === true) {
      try {
        const analysisResult = await getClarityAnalysis({ url, ultralite: true } as any);
        return NextResponse.json({ ok: true, scraped, analysis: analysisResult });
      } catch (err: any) {
        const { simpleLiteAnalysis } = await import('@/lib/local-analysis');
        const { normalizeToFull } = await import('@/lib/normalize-analysis');
        const fallback = simpleLiteAnalysis((scraped.textContent || '').slice(0, 200));
        return NextResponse.json({ ok: true, scraped, analysis: normalizeToFull(fallback), note: `Ultralite analysis failed and returned fallback: ${err?.message || String(err)}` });
      }
    }

    // Allow forcing a super-lite or lite analysis directly for quick tests
    if (body?.superlite === true) {
      // Call the server action directly and rely on its internal timeouts and fallback logic.
      // `getClarityAnalysis` returns an object with `message` and `analysis` even on partial failures.
      try {
        const analysisResult = await getClarityAnalysis({ url, superlite: true } as any);
        return NextResponse.json({ ok: true, scraped, analysis: analysisResult });
      } catch (err: any) {
        // As a last resort, return a local heuristic so the client still receives useful data.
        const { simpleLiteAnalysis } = await import('@/lib/local-analysis');
        const { normalizeToFull } = await import('@/lib/normalize-analysis');
        const fallback = simpleLiteAnalysis(scraped.textContent);
        return NextResponse.json({ ok: true, scraped, analysis: normalizeToFull(fallback), note: `Super-lite analysis failed and returned fallback: ${err?.message || String(err)}` });
      }
    }

      if (body?.lite === true) {
        const maxChars = parseInt(process.env.LITE_MAX_CHARS || '4000', 10);
        const truncated = scraped.textContent && scraped.textContent.length > maxChars
          ? `${scraped.textContent.slice(0, maxChars)}\n\n[...truncated]`
          : scraped.textContent;
        const analysisPromise = analyzePlainLanguageLite({ textContent: truncated, url });
        try {
          const analysisResult = await timeoutPromise(analysisPromise, 30000);
          return NextResponse.json({ ok: true, scraped, analysis: analysisResult });
        } catch (err: any) {
          // local fallback
          const { simpleLiteAnalysis } = await import('@/lib/local-analysis');
          const fallback = simpleLiteAnalysis(truncated);
          const { normalizeToFull } = await import('@/lib/normalize-analysis');
          return NextResponse.json({ ok: true, scraped, analysis: normalizeToFull(fallback), note: `Lite analysis timed out: ${err?.message || String(err)} (local heuristic returned)` });
        }
      }

      // Default: call the regular action (which may do full analysis)
      const analysisPromise = getClarityAnalysis({ url });
      const analysisResult = await timeoutPromise(analysisPromise, 30000);
      return NextResponse.json({ ok: true, scraped, analysis: analysisResult });
    } catch (analysisErr: any) {
      // If analysis times out or fails, return scraped payload and the error message
      return NextResponse.json({ ok: false, error: analysisErr?.message || String(analysisErr), scraped }, { status: 502 });
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
