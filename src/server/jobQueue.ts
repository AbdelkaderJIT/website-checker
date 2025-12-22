import { v4 as uuidv4 } from 'uuid';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export type AnalysisJob = {
  id: string;
  url: string;
  status: JobStatus;
  createdAt: number;
  updatedAt: number;
  result?: any;
  error?: string;
};

import fs from 'fs/promises';
import path from 'path';

const jobs = new Map<string, AnalysisJob>();
const queue: string[] = [];
let processing = false;

const JOBS_DIR = path.join(process.cwd(), '.cache');
const JOBS_FILE = path.join(JOBS_DIR, 'analysis-jobs.json');

async function persistJobs() {
  try {
    await fs.mkdir(JOBS_DIR, { recursive: true });
    const arr = Array.from(jobs.values());
    await fs.writeFile(JOBS_FILE, JSON.stringify(arr, null, 2), 'utf8');
  } catch (err) {
    console.warn('Failed to persist jobs:', err);
  }
}

async function loadJobs() {
  try {
    const raw = await fs.readFile(JOBS_FILE, 'utf8');
    const arr: AnalysisJob[] = JSON.parse(raw);
    for (const j of arr) {
      jobs.set(j.id, j);
      if (j.status === 'pending' || j.status === 'running') {
        // Re-enqueue unfinished jobs so they can be processed by the worker
        queue.push(j.id);
      }
    }
  } catch (err) {
    // no-op if file doesn't exist or parse fails
  }
}

// Load previous jobs (if any) on module initialization
loadJobs().catch(e => console.warn('Failed to load jobs:', e));

export function enqueueAnalysis(url: string): string {
  const id = uuidv4();
  const job: AnalysisJob = {
    id,
    url,
    status: 'pending',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  jobs.set(id, job);
  // persist state so next process instance can see it in dev
  persistJobs().catch(e => console.warn('persistJobs error:', e));
  queue.push(id);
  // trigger processing (does nothing if already running)
  processQueue().catch(err => console.error('Job processor error:', err));
  return id;
}

export function getJob(id: string): AnalysisJob | undefined {
  return jobs.get(id);
}

async function processQueue() {
  if (processing) return;
  processing = true;
  // Process jobs one at a time to avoid extra concurrency on local machine.
  while (queue.length > 0) {
    const id = queue.shift()!;
    const job = jobs.get(id);
    if (!job) continue;
    job.status = 'running';
    job.updatedAt = Date.now();
    jobs.set(id, job);
    console.log('Processing job', id, job.url);

    try {
      // Import action dynamically to avoid circular top-level deps
      const { getClarityAnalysis } = await import('@/app/clarity-grader/actions');
      // Run full analysis (this may be slow/CPU heavy) — running in background so it doesn't block HTTP requests.
      const result = await getClarityAnalysis({ url: job.url });
      job.result = result;
      job.status = 'completed';
      job.updatedAt = Date.now();
      jobs.set(id, job);
      persistJobs().catch(e => console.warn('persistJobs error:', e));
      console.log('Job completed', id);
    } catch (err: any) {
      job.status = 'failed';
      job.error = err instanceof Error ? err.message : String(err);
      job.updatedAt = Date.now();
      jobs.set(id, job);
      persistJobs().catch(e => console.warn('persistJobs error:', e));
      console.error('Job failed', id, job.error);
    }
    // Gentle pause between jobs to avoid continuous CPU saturation during dev
    await new Promise(r => setTimeout(r, 1000));
  }
  processing = false;
}

// Export a simple listing (not used by routes directly, but helpful for debugging)
export async function listJobs() {
  return Array.from(jobs.values()).sort((a, b) => b.createdAt - a.createdAt);
}

// Ensure the queue is being processed. Exposed so HTTP polling endpoints can kick the worker
export function ensureProcessing() {
  processQueue().catch(err => console.error('Job processor error (ensureProcessing):', err));
}

