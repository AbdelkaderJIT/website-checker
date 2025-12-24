import { NextResponse } from 'next/server';
import { getClarityAnalysis } from '@/app/clarity-grader/actions';
import { scrapePage } from '@/server/scraper';

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

    // Call the full analysis action
    const analysisPromise = getClarityAnalysis({ url });
    const analysisResult = await timeoutPromise(analysisPromise, 300000);
    return NextResponse.json({ ok: true, scraped, analysis: analysisResult });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
