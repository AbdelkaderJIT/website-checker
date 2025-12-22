import { NextResponse } from 'next/server';
import { scrapePage } from '@/server/scraper';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url).searchParams.get('url');
    if (!url) {
      return NextResponse.json({ error: 'Missing url query parameter' }, { status: 400 });
    }

    const scraped = await scrapePage(url);
    return NextResponse.json({ ok: true, scraped });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
