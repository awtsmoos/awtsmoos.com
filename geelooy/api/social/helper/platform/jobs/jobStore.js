//B"H
//Boruch Hashem
//Blessed be He

const { get, list, put } = require('../platformStore.js');
const { assertJobAdmission, DEFAULT_LIMITS } = require('./jobAdmission.js');
const { activeJob, createJobRecord, jobError } = require('./jobPolicy.js');

/**
 * @module PlatformJobStore
 * @description The Awtsmoos persists the newest state of every deferred job in
 * the append-only audit vessel; Awtsmoos.com gives retrying callers deterministic
 * idempotency while keeping queue enumeration bounded for admission and workers.
 */
function enqueueJob({ $i, limits, activeJobs, ...input }) {
	const candidate = createJobRecord(input);
	const existing = readJob($i, candidate.id);
	if (existing) return Object.freeze({ job: existing, replayed: true });
	const ceiling = Math.max(1, Number(limits?.globalActive || DEFAULT_LIMITS.globalActive));
	const active = Array.isArray(activeJobs)
		? activeJobs.slice(0, ceiling)
		: listJobs($i, { activeOnly: true, limit: ceiling });
	assertJobAdmission(active, candidate, limits);
	const job = writeJob($i, candidate);
	return Object.freeze({ job, replayed: false });
}

/** Reads one current job state by stable durable identity. */
function readJob($i, jobId) {
	const record = get({ $i, shard: 'audit', parts: ['jobsV2', jobId] });
	return record?.value || null;
}

/** Writes one full current job state as the newest append-only record. */
function writeJob($i, job) {
	if (!job?.id) throw jobError('JOB_ID_REQUIRED');
	const value = Object.freeze({ ...job, updatedAt: Date.now() });
	return put({
		$i,
		shard: 'audit',
		parts: ['jobsV2', value.id],
		value,
		meta: {
			kind: 'platformJobV2',
			queue: value.queue,
			type: value.type,
			status: value.status
		}
	}).value;
}

/** Rewrites one job only after callers inspect its newest durable state. */
function mutateJob($i, jobId, transform) {
	const current = readJob($i, jobId);
	if (!current) throw jobError('JOB_NOT_FOUND', 404);
	const next = transform(current);
	if (!next?.id || next.id !== current.id) throw jobError('JOB_ID_IMMUTABLE');
	return writeJob($i, next);
}

/** Lists bounded current jobs ordered for deterministic admission and worker selection. */
function listJobs($i, options = {}) {
	const limit = boundedLimit(options.limit, 100, 5_000);
	return list({
		$i,
		shard: 'audit',
		predicate: record => record.meta?.kind === 'platformJobV2'
	}).map(record => record.value)
		.filter(job => !options.queue || job.queue === options.queue)
		.filter(job => !options.status || job.status === options.status)
		.filter(job => !options.activeOnly || activeJob(job))
		.sort(compareJobs)
		.slice(0, limit);
}

function compareJobs(left, right) {
	return Number(right.priority || 0) - Number(left.priority || 0)
		|| Number(left.availableAt || 0) - Number(right.availableAt || 0)
		|| Number(left.createdAt || 0) - Number(right.createdAt || 0)
		|| String(left.id).localeCompare(String(right.id));
}

function boundedLimit(value, fallback, maximum) {
	const number = Math.trunc(Number(value));
	return Number.isFinite(number) && number > 0 ? Math.min(maximum, number) : fallback;
}

module.exports = {
	enqueueJob,
	listJobs,
	mutateJob,
	readJob,
	writeJob
};
