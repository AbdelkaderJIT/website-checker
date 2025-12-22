import * as cheerio from 'cheerio';

const url = process.argv[2] || 'https://example.com';

async function scrape(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'website-checker/1.0' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const title = ($('title').first().text() || '').trim();

  const paragraphs = $('p')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean);

  const headings = {};
  for (let i = 1; i <= 6; i++) {
    const tag = `h${i}`;
    headings[tag] = $(tag).map((_, el) => $(el).text().trim()).get().filter(Boolean);
  }

  const images = $('img')
    .map((_, el) => {
      const attribs = el.attribs || {};
      return { src: attribs.src || attribs['data-src'] || '', alt: (attribs.alt || '').trim() };
    })
    .get();

  return { url, title, paragraphsCount: paragraphs.length, headings, imagesCount: images.length };
}

(async () => {
  try {
    const out = await scrape(url);
    console.log(JSON.stringify(out, null, 2));
  } catch (err) {
    console.error('Error:', err?.message || err);
    process.exit(1);
  }
})();
