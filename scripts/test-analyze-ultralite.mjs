#!/usr/bin/env node
import fetch from 'node-fetch';

const url = process.argv[2] || 'https://example.com';
const endpoint = process.env.ENDPOINT || 'http://localhost:9002/api/analyze';

(async () => {
  try {
    console.log(`POST ${endpoint} { url: "${url}", ultralite: true }`);
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, ultralite: true }),
    });
    const body = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', body);
  } catch (err) {
    console.error('Request failed:', err);
    process.exit(1);
  }
})();
