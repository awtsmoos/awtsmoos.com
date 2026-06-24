/* B"H
An export job is a promise with receipts: preset, status, progress, artifacts,
and validation notes. No bytes are invented here; proof is explicit.
*/
export function createExportJob(input = {}) {
  return { id:input.id || id('export'), kind:'ExportJob', name:input.name || 'Export Job', preset:input.preset || null, status:input.status || 'queued', progress:Number(input.progress || 0), createdAt:input.createdAt || Date.now(), startedAt:null, finishedAt:null, artifacts:input.artifacts || [], validation:input.validation || [] };
}
export function startExportJob(job) { job.status = 'running'; job.startedAt = Date.now(); job.progress = Math.max(job.progress, .01); return job; }
export function completeExportJob(job, artifact = null) { job.status = 'complete'; job.progress = 1; job.finishedAt = Date.now(); if (artifact) job.artifacts.push(artifact); return job; }
export function failExportJob(job, error) { job.status = 'failed'; job.error = String(error?.message || error); job.finishedAt = Date.now(); return job; }
export function updateExportProgress(job, progress) { job.progress = Math.max(0, Math.min(1, Number(progress))); return job; }
function id(prefix) { return `${prefix}-${globalThis.crypto?.randomUUID?.() || Date.now()}`; }
