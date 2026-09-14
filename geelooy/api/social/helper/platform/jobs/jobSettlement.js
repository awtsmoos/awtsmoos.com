//B"H
//Boruch Hashem
//Blessed be He

const { jobError, retryDelayMs } = require('./jobPolicy.js');
const { assertLease } = require('./jobLease.js');
const { readJob, writeJob } = require('./jobStore.js');
const { syncActiveJobIndex } = require('./jobActiveIndex.js');
const { withJobLock } = require('./jobLock.js');

const MAX_RESULT_BYTES = 64 * 1024;
const MAX_ERROR_LENGTH = 2_000;

/**
 * @module PlatformJobSettlement
 * @description The Awtsmoos lets only the current lease holder settle work;
 * Awtsmoos.com bounds results, retries with backoff, dead-letters exhausted work,
 * and makes cancellation final so stale workers cannot commit afterward.
 */
async function completeJob({ $i, jobId, leaseToken, result, now = Date.now() }) {
	return transition($i, jobId, current => {
		assertLease(current, leaseToken, now);
		return {
			...current,
			status: 'complete',
			lease: null,
			result: boundedResult(result),
			error: null,
			finishedAt: now
		};
	});
}

/** Requeues retryable failure with exponential delay or marks exhausted work dead. */
async function failJob({ $i, jobId, leaseToken, error, retryable = true, now = Date.now() }) {
	return transition($i, jobId, current => {
		assertLease(current, leaseToken, now);
		const exhausted = Number(current.attempts || 0) >= Number(current.maxAttempts || 1);
		const willRetry = retryable !== false && !exhausted;
		return {
			...current,
			status: willRetry ? 'queued' : 'dead',
			lease: null,
			availableAt: willRetry ? now + retryDelayMs(current.attempts) : current.availableAt,
			result: null,
			error: normalizedError(error),
			finishedAt: willRetry ? null : now
		};
	});
}

/** Cancels queued or running work under the same mutation lock used by workers. */
async function cancelJob({ $i, jobId, reason = 'cancelled', now = Date.now() }) {
	return transition($i, jobId, current => {
		if (['complete', 'dead', 'cancelled'].includes(current.status)) return current;
		return {
			...current,
			status: 'cancelled',
			lease: null,
			result: null,
			error: normalizedError(reason),
			finishedAt: now
		};
	});
}

/** Manually requeues only dead or cancelled work; completed side effects stay final. */
async function retryJob({ $i, jobId, now = Date.now() }) {
	return transition($i, jobId, current => {
		if (!['dead', 'cancelled'].includes(current.status)) {
			throw jobError('JOB_NOT_RETRYABLE', 409);
		}
		return {
			...current,
			status: 'queued',
			attempts: 0,
			lease: null,
			result: null,
			error: null,
			availableAt: now,
			finishedAt: null
		};
	});
}

async function transition($i, jobId, transform) {
	return withJobLock($i, jobId, async () => {
		const current = readJob($i, jobId);
		if (!current) throw jobError('JOB_NOT_FOUND', 404);
		const settled = writeJob($i, transform(current));
		await syncActiveJobIndex($i, settled);
		return settled;
	});
}

function boundedResult(value) {
	const result = value === undefined ? null : value;
	let encoded;
	try {
		encoded = JSON.stringify(result);
	} catch {
		throw jobError('JOB_RESULT_INVALID');
	}
	if (Buffer.byteLength(encoded) > MAX_RESULT_BYTES) throw jobError('JOB_RESULT_TOO_LARGE');
	return JSON.parse(encoded);
}

function normalizedError(error) {
	const code = error?.code || error?.message || error || 'JOB_FAILED';
	return String(code).slice(0, MAX_ERROR_LENGTH);
}

module.exports = {
	MAX_RESULT_BYTES,
	cancelJob,
	completeJob,
	failJob,
	retryJob
};
