import { NextResponse } from 'next/server';
import { scrapePage } from '@/server/scraper';
import { enqueueAnalysis, getJob } from '@/server/jobQueue';

function timeoutPromise<T>(p: Promise<T>, ms = 5000): Promise<T> {
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

    const scraped = await scrapePage(url);

    // Heuristic-first: return a quick local heuristic immediately so the UI shows a result without waiting for AI
    const { simpleLiteAnalysis } = await import('@/lib/local-analysis');
    const { normalizeToFull } = await import('@/lib/normalize-analysis');
    const heuristic = simpleLiteAnalysis(scraped.textContent);
    const partial = { message: 'Partial analysis (heuristic)', analysis: normalizeToFull(heuristic) };

    // Enqueue a full analysis job for background processing (will update results later)
    const jobId = enqueueAnalysis(url);

    return NextResponse.json({ ok: true, jobId, scraped, partial });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
