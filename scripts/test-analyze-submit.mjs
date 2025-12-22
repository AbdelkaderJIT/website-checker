#!/usr/bin/env node
import fetch from 'node-fetch';
const endpoint = process.env.ENDPOINT || 'http://localhost:9002/api/analyze/submit';
const statusEndpoint = process.env.ENDPOINT_STATUS || 'http://localhost:9002/api/analyze/status';
const url = process.argv[2] || 'https://example.com';

(async () => {
  try {
    console.log(`POST ${endpoint} { url: "${url}" }`);
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const json = await res.json();
    console.log('Response:', JSON.stringify(json, null, 2));
    if (json.ok && json.jobId) {
      const jobId = json.jobId;
      console.log('Polling job status for', jobId);
      for (let i = 0; i < 12; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const s = await fetch(`${statusEndpoint}?jobId=${jobId}`);
        const sj = await s.json();
        console.log('Status poll', i + 1, sj);
        if (sj.ok && sj.job && (sj.job.status === 'completed' || sj.job.status === 'failed')) break;
      }
    }
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
