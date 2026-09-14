//B"H
//Boruch Hashem
//Blessed be He

const { claimJob, leaseActive, renewJobLease } = require('./jobLease.js');
const { listJobs, readJob } = require('./jobStore.js');
const {
	listActiveJobIndex,
	rebuildActiveJobIndex,
	syncActiveJobIndex
} = require('./jobActiveIndex.js');
const { completeJob, failJob } = require('./jobSettlement.js');
const {
	boundedScanLimit,
	boundedTimeout,
	timeoutPromise
} = require('./jobWorkerPolicy.js');

/**
 * @module PlatformJobWorker
 * @description The Awtsmoos lets one worker claim bounded queued work and settle
 * through durable lease testimony; Awtsmoos.com keeps handlers isolated and makes
 * stale claims harmless even when several Node processes scan the same queue.
 */
async function runNextJob(options = {}) {
	const now = options.now ?? Date.now();
	const candidate = await claimCandidate(options, now);
	if (!candidate) return Object.freeze({ ran: false, job: null });
	const handler = options.handlers?.[candidate.type];
	if (typeof handler !== 'function') {
		const dead = await failJob({
			$i: options.$i,
			jobId: candidate.id,
			leaseToken: candidate.lease.token,
			error: 'JOB_HANDLER_NOT_FOUND',
			retryable: false,
			now
		});
		return Object.freeze({ ran: true, job: dead });
	}
	return executeHandler(options, candidate, handler);
}

async function claimCandidate(options, now) {
	const limit = boundedScanLimit(options.scanLimit);
	let candidates = listActiveJobIndex(options.$i, { queue: options.queue, limit });
	if (!candidates) {
		const active = listJobs(options.$i, { activeOnly: true, limit: 5_000 });
		await rebuildActiveJobIndex(options.$i, active);
		candidates = active.filter(job => !options.queue || job.queue === options.queue).slice(0, limit);
	}
	for (const entry of candidates) {
		const job = readJob(options.$i, entry.id);
		if (!job || !['queued', 'running'].includes(job.status)) {
			await syncActiveJobIndex(options.$i, { id: entry.id, status: 'stale' });
			continue;
		}
		const available = job.status === 'queued' && Number(job.availableAt || 0) <= now;
		const reclaimable = job.status === 'running' && !leaseActive(job, now);
		if (!available && !reclaimable) continue;
		try {
			return await claimJob({
				$i: options.$i,
				jobId: job.id,
				workerId: options.workerId,
				leaseMs: options.leaseMs,
				now
			});
		} catch (error) {
			if (!['JOB_ALREADY_LEASED', 'JOB_NOT_AVAILABLE'].includes(error.code)) throw error;
		}
	}
	return null;
}

async function executeHandler(options, job, handler) {
	const timeoutMs = boundedTimeout(options.timeoutMs);
	const controller = new AbortController();
	let timer = null;
	try {
		const result = await Promise.race([
			Promise.resolve(handler({
				job,
				payload: job.payload,
				signal: controller.signal,
				renew: leaseMs => renewJobLease({
					$i: options.$i,
					jobId: job.id,
					leaseToken: job.lease.token,
					leaseMs
				})
			})),
			timeoutPromise(controller, timeoutMs, handle => { timer = handle; })
		]);
		const complete = await completeJob({
			$i: options.$i,
			jobId: job.id,
			leaseToken: job.lease.token,
			result
		});
		return Object.freeze({ ran: true, job: complete });
	} catch (error) {
		const failed = await failJob({
			$i: options.$i,
			jobId: job.id,
			leaseToken: job.lease.token,
			error,
			retryable: error?.retryable !== false
		});
		return Object.freeze({ ran: true, job: failed });
	} finally {
		if (timer) clearTimeout(timer);
		controller.abort();
	}
}

module.exports = { runNextJob };
