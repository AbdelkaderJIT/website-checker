const urlToTest = process.argv[2] || 'https://example.com';

async function run() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch('http://localhost:9002/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlToTest }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    console.log('Status:', res.status);
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Non-JSON response:\n', text);
    }
  } catch (err) {
    console.error('Error calling /api/analyze:', err?.message || err);
    process.exit(1);
  }
}

run();
