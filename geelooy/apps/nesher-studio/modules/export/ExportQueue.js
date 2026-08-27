/* B"H */
import { createExportJob, startExportJob, completeExportJob, failExportJob } from './ExportJob.js';
export function createExportQueue(input = {}) { return { kind:'ExportQueue', jobs:input.jobs || [], activeJobId:null, completed:[], failed:[] }; }
export function enqueueExport(queue, job) { const model = createExportJob(job); queue.jobs.push(model); return model; }
export async function runNextExport(queue, worker) { const job = queue.jobs.find(j => j.status === 'queued'); if (!job) return null; queue.activeJobId = job.id; startExportJob(job); try { const artifact = await worker(job); completeExportJob(job, artifact); queue.completed.push(job.id); } catch (e) { failExportJob(job, e); queue.failed.push(job.id); } finally { queue.activeJobId = null; } return job; }
export function queueStats(queue) { return { queued:queue.jobs.filter(j=>j.status==='queued').length, running:queue.jobs.filter(j=>j.status==='running').length, complete:queue.completed.length, failed:queue.failed.length }; }
