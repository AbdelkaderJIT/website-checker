import * as cheerio from 'cheerio';

export type ScrapeResult = {
  textContent: string;
  structure: string; // JSON string with headings and structural info
  imageMetadata: string; // JSON string with images array
  rawHtml?: string;
};

export async function scrapePage(url: string): Promise<ScrapeResult> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'website-checker/1.0 (+https://example.com)' } });
    if (!res.ok) {
      throw new Error(`Failed to fetch page: ${res.status} ${res.statusText}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const title = ($('title').first().text() || '').trim();

    const paragraphs = $('p')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean);

    const textContent = [title, ...paragraphs].filter(Boolean).join('\n\n');

    const headings: Record<string, string[]> = {};
    for (let i = 1; i <= 6; i++) {
      const tag = `h${i}`;
      headings[tag] = $(tag).map((_, el) => $(el).text().trim()).get().filter(Boolean);
    }

    const lists = $('ul, ol')
      .map((_, el) => {
        return $(el)
          .find('li')
          .map((__, li) => $(li).text().trim())
          .get()
          .filter(Boolean);
      })
      .get();

    const images = $('img')
      .map((_, el) => {
        const attribs: any = el.attribs || {};
        return {
          src: attribs.src || attribs['data-src'] || '',
          alt: (attribs.alt || '').trim(),
          title: (attribs.title || '').trim(),
        };
      })
      .get();

    const structure = {
      headings,
      listsCount: lists.length,
      lists,
      totalHeadings: Object.values(headings).reduce((s, a) => s + a.length, 0),
      totalLists: lists.length,
    };

    return {
      textContent,
      structure: JSON.stringify(structure),
      imageMetadata: JSON.stringify(images),
      rawHtml: html,
    };
  } catch (err: any) {
    return {
      textContent: `Failed to scrape ${url}: ${err?.message || String(err)}`,
      structure: JSON.stringify({ error: err?.message || String(err) }),
      imageMetadata: JSON.stringify([]),
    };
  }
}
