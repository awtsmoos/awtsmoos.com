//B"H
//Boruch Hashem
//Blessed be He

const { randomUUID } = require('node:crypto');
const { finalJob, jobError } = require('./jobPolicy.js');
const { readJob, writeJob } = require('./jobStore.js');
const { syncActiveJobIndex } = require('./jobActiveIndex.js');
const { withJobLock } = require('./jobLock.js');

const DEFAULT_LEASE_MS = 30_000;
const MAX_LEASE_MS = 5 * 60_000;

/**
 * @module PlatformJobLease
 * @description The Awtsmoos gives a worker temporary authority over one durable
 * job; Awtsmoos.com serializes claims across processes and rejects stale tokens.
 */
async function claimJob({ $i, jobId, workerId = 'worker', leaseMs, now = Date.now() }) {
	return withJobLock($i, jobId, async () => {
		const current = requiredJob($i, jobId);
		assertClaimable(current, now);
		const duration = normalizedLeaseMs(leaseMs);
		const lease = Object.freeze({
			token: randomUUID(),
			workerId: String(workerId || 'worker').slice(0, 120),
			claimedAt: now,
			expiresAt: now + duration
		});
		const claimed = writeJob($i, {
			...current,
			status: 'running',
			attempts: Number(current.attempts || 0) + 1,
			lease,
			error: null
		});
		await syncActiveJobIndex($i, claimed);
		return claimed;
	});
}

/** Extends a still-valid lease for the same worker token. */
async function renewJobLease({ $i, jobId, leaseToken, leaseMs, now = Date.now() }) {
	return withJobLock($i, jobId, async () => {
		const current = requiredJob($i, jobId);
		assertLease(current, leaseToken, now);
		const renewed = writeJob($i, {
			...current,
			lease: Object.freeze({
				...current.lease,
				expiresAt: now + normalizedLeaseMs(leaseMs)
			})
		});
		await syncActiveJobIndex($i, renewed);
		return renewed;
	});
}

function assertClaimable(job, now) {
	if (finalJob(job)) throw leaseError('JOB_ALREADY_FINAL');
	if (job.status === 'running' && leaseActive(job, now)) {
		throw leaseError('JOB_ALREADY_LEASED');
	}
	if (job.status === 'queued' && Number(job.availableAt || 0) > now) {
		throw leaseError('JOB_NOT_AVAILABLE');
	}
}

function assertLease(job, token, now = Date.now()) {
	if (job.status !== 'running' || !job.lease) throw leaseError('JOB_NOT_RUNNING');
	if (job.lease.token !== String(token || '')) throw leaseError('JOB_LEASE_TOKEN_INVALID');
	if (!leaseActive(job, now)) throw leaseError('JOB_LEASE_EXPIRED');
	return job.lease;
}

function requiredJob($i, jobId) {
	const job = readJob($i, jobId);
	if (!job) throw jobError('JOB_NOT_FOUND', 404);
	return job;
}

function leaseActive(job, now = Date.now()) {
	return Boolean(job?.lease && Number(job.lease.expiresAt || 0) > now);
}

function normalizedLeaseMs(value) {
	const number = Math.trunc(Number(value));
	if (!Number.isFinite(number) || number <= 0) return DEFAULT_LEASE_MS;
	return Math.min(MAX_LEASE_MS, number);
}

function leaseError(code) {
	return jobError(code, 409);
}

module.exports = {
	DEFAULT_LEASE_MS,
	MAX_LEASE_MS,
	assertLease,
	claimJob,
	leaseActive,
	renewJobLease
};
