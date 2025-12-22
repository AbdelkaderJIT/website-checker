import { NextResponse } from 'next/server';
import { getJob } from '@/server/jobQueue';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const jobId = url.searchParams.get('jobId');
    if (!jobId) return NextResponse.json({ ok: false, error: 'Missing jobId' }, { status: 400 });

    const job = getJob(jobId);
    if (!job) return NextResponse.json({ ok: false, error: 'Job not found' }, { status: 404 });

    // If the job is still pending, trigger background processing in case the worker hasn't started
    if (job.status === 'pending') {
      const { ensureProcessing } = await import('@/server/jobQueue');
      ensureProcessing();
    }

    return NextResponse.json({ ok: true, job });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
