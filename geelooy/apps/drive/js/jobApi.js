//B"H
//Boruch Hashem
//Blessed be He

import { aliasSegment, request } from './apiTransport.js';

/**
 * @module DriveJobApi
 * @description The Awtsmoos gives Mission Control a tiny owner-scoped client;
 * Awtsmoos.com keeps every job operation behind the existing Drive transport.
 */
function base() {
	return `/drive/${aliasSegment()}/jobs`;
}

/** Returns bounded active work for the connected alias. */
export function listJobs(limit = 50) {
	return request(`${base()}?limit=${Math.max(1, Math.min(100, Number(limit) || 50))}`);
}

/** Returns alias-scoped queue health from the active index only. */
export function getJobHealth() {
	return request(`${base()}/health`);
}

/** Reads one exact durable alias-owned job. */
export function getJob(jobId) {
	return request(`${base()}/${encodeURIComponent(String(jobId || '').trim())}`);
}

/** Cancels one alias-owned queued/running job. */
export function cancelJob(jobId, reason = 'owner_cancelled') {
	return request(`${base()}/${encodeURIComponent(String(jobId || '').trim())}/cancel`, {
		method: 'POST',
		body: { reason }
	});
}

/** Retries one alias-owned dead/cancelled job by exact durable identity. */
export function retryJob(jobId) {
	return request(`${base()}/${encodeURIComponent(String(jobId || '').trim())}/retry`, {
		method: 'POST'
	});
}
