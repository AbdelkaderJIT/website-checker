import { NextResponse } from 'next/server';
import { scrapePage } from '@/server/scraper';
import { enqueueAnalysis } from '@/server/jobQueue';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = body?.url;
    if (!url) return NextResponse.json({ ok: false, error: 'Missing url field' }, { status: 400 });

    const scraped = await scrapePage(url);

    // Enqueue a full analysis job for background processing
    const jobId = enqueueAnalysis(url);

    return NextResponse.json({ ok: true, jobId, scraped });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
