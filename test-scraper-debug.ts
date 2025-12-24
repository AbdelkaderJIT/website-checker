import { scrapePage } from './src/server/scraper';

// Test with a simple URL
const testUrl = 'https://www.ibm.com/think/topics/mixture-of-experts';

async function test() {
  console.log(`Testing Playwright scraper with: ${testUrl}\n`);

  try {
    const result = await scrapePage(testUrl);
    
    console.log('\n========== SCRAPE RESULT ==========');
    console.log('textContent length:', result.textContent.length);
    console.log('textContent preview:', result.textContent.substring(0, 500));
    console.log('\nstructure:', result.structure);
    console.log('\nimageMetadata:', result.imageMetadata);
    console.log('\nrawHtml length:', result.rawHtml?.length || 0);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
