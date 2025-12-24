import { chromium } from 'playwright';

export type ScrapeResult = {
  textContent: string;
  structure: string; // JSON string with headings and structural info
  imageMetadata: string; // JSON string with images array
  rawHtml?: string;
};

export async function scrapePage(url: string): Promise<ScrapeResult> {
  let browser = null;
  try {
    console.log(`[Playwright] Starting scrape for: ${url}`);
    browser = await chromium.launch();
    const page = await browser.newPage();
    
    console.log(`[Playwright] Navigating to URL...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      console.log(`[Playwright] Page loaded (networkidle)`);
    } catch (gotoErr: any) {
      console.warn(`[Playwright] networkidle goto timed out or failed, retrying with domcontentloaded: ${gotoErr?.message || String(gotoErr)}`);
      // Retry with a more permissive wait and longer timeout
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      console.log(`[Playwright] Page loaded (domcontentloaded)`);
    }
    
    // Extract HTML
    const html = await page.content();
    console.log(`[Playwright] HTML extracted, length: ${html.length}`);
    
    // Extract title
    const title = await page.title();
    console.log(`[Playwright] Title: "${title}"`);
    
    // Extract paragraphs using smart detection (P tags and text-heavy DIVs)
    const paragraphs = await page.evaluate(() => {
      const results: string[] = [];
      const seen = new Set<string>();
      
      const isVisible = (el: Element) => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      };

      // Find all P tags
      document.querySelectorAll('p').forEach(el => {
        if (isVisible(el)) {
          const text = (el.textContent || '').trim();
          if (text.length > 0) {
            results.push(text);
            seen.add(text);
          }
        }
      });

      // Find DIVs that act as paragraphs
      document.querySelectorAll('div, article, section').forEach(el => {
        if (!isVisible(el)) return;
        
        const text = (el.textContent || '').trim();
        if (seen.has(text)) return;

        // Check if element has block-level children
        const hasBlockChildren = Array.from(el.children).some(child => {
          const style = window.getComputedStyle(child);
          const tag = child.tagName;
          return ['DIV', 'P', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'NAV'].includes(tag) ||
                 ['block', 'flex', 'grid', 'table'].includes(style.display);
        });

        // If no block children and significant text length, treat as paragraph
        if (!hasBlockChildren && text.length > 40) {
          results.push(text);
          seen.add(text);
        }
      });

      return results;
    });
    console.log(`[Playwright] Found ${paragraphs.length} paragraphs`);
    console.log(`[Playwright] First 3 paragraphs:`, paragraphs.slice(0, 3));
    
    // Extract all visible text content using innerText, but inject markdown headers first
    const textContent = await page.evaluate(() => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const originalTexts: Map<Element, string> = new Map();
      
      // Prepend markdown markers to headings in the DOM
      headings.forEach(h => {
        originalTexts.set(h, h.textContent || '');
        const level = parseInt(h.tagName.substring(1)) || 1;
        h.textContent = `${'#'.repeat(level)} ${h.textContent}`;
      });

      // Get the full visible text of the body
      const text = document.body.innerText;

      // Restore original text (cleanup)
      headings.forEach(h => {
        h.textContent = originalTexts.get(h) || '';
      });

      return text;
    });

    console.log(`[Playwright] Total text content length: ${textContent.length}`);
    
    // Extract headings
    const headings: Record<string, string[]> = {};
    for (let i = 1; i <= 6; i++) {
      const tag = `h${i}`;
      headings[tag] = await page.$$eval(tag, (els) =>
        els
          .filter(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
          })
          .map(el => (el.textContent || '').trim())
          .filter(Boolean)
      );
    }
    console.log(`[Playwright] Headings extracted:`, Object.entries(headings).map(([k, v]) => `${k}: ${v.length}`).join(', '));
    
    // Extract lists
    const lists = await page.$$eval('ul, ol', (els) =>
      els.map(listEl => {
        const items = listEl.querySelectorAll('li');
        return Array.from(items)
          .map(li => (li.textContent || '').trim())
          .filter(Boolean);
      })
    );
    console.log(`[Playwright] Found ${lists.length} lists`);
    
    // Extract images
    const images = await page.$$eval('img', (els) =>
      els.map(img => ({
        src: img.getAttribute('src') || img.getAttribute('data-src') || '',
        alt: (img.getAttribute('alt') || '').trim(),
        title: (img.getAttribute('title') || '').trim(),
      }))
    );
    console.log(`[Playwright] Found ${images.length} images`);
    console.log(`[Playwright] First 3 images:`, images.slice(0, 3));
    
    const structure = {
      headings,
      listsCount: lists.length,
      lists,
      totalHeadings: Object.values(headings).reduce((s, a) => s + a.length, 0),
      totalLists: lists.length,
      paragraphCount: paragraphs.length,
      paragraphs,
    };
    
    await page.close();
    
    console.log(`[Playwright] Scraping completed successfully`);
    return {
      textContent,
      structure: JSON.stringify(structure),
      imageMetadata: JSON.stringify(images),
      rawHtml: html,
    };
  } catch (err: any) {
    console.error(`[Playwright] Error during scraping:`, err);
    return {
      textContent: `Failed to scrape ${url}: ${err?.message || String(err)}`,
      structure: JSON.stringify({ error: err?.message || String(err) }),
      imageMetadata: JSON.stringify([]),
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
