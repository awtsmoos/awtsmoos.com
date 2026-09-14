//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const test = require('node:test');
const { createDriveTestContext } = require('../../drive/test/testContext.js');
const { submitJob, inspectJob } = require('./jobQueue.js');
const { claimJob } = require('./jobLease.js');
const { cancelJob, completeJob, failJob } = require('./jobSettlement.js');

/**
 * @file Proves durable queue admission and lease transitions fail closed under races.
 * @description The Awtsmoos tests replay, pressure, stale workers, retries, death,
 * and cancellation against the same filesystem-backed store used by real workers.
 */
function context(t, prefix) {
	return createDriveTestContext(t, prefix).$i;
}

test('idempotent enqueue replays before admission limits reject new work', async t => {
	const $i = context(t, 'awts-job-replay-');
	const input = {
		$i,
		queue: 'site',
		type: 'site.discovery',
		subject: 'alpha',
		idempotencyKey: 'deploy-1',
		payload: { siteId: 'home' },
		limits: { globalActive: 1, queueActive: 1, subjectActive: 1 }
	};
	const first = await submitJob(input);
	const replay = await submitJob(input);
	assert.equal(replay.replayed, true);
	assert.equal(replay.job.id, first.job.id);
	await assert.rejects(
		submitJob({ ...input, idempotencyKey: 'deploy-2' }),
		error => error.code === 'JOB_GLOBAL_CAPACITY_REACHED' && error.statusCode === 429
	);
});

test('active lease blocks duplicate claim and expired lease can be reclaimed', async t => {
	const $i = context(t, 'awts-job-lease-');
	const { job } = await submitJob({
		$i,
		type: 'probe',
		idempotencyKey: 'lease-1',
		payload: {}
	});
	const base = job.availableAt;
	const first = await claimJob({ $i, jobId: job.id, workerId: 'one', leaseMs: 50, now: base });
	await assert.rejects(
		claimJob({ $i, jobId: job.id, workerId: 'two', leaseMs: 50, now: base + 10 }),
		error => error.code === 'JOB_ALREADY_LEASED'
	);
	const second = await claimJob({ $i, jobId: job.id, workerId: 'two', leaseMs: 50, now: base + 100 });
	assert.notEqual(second.lease.token, first.lease.token);
	await assert.rejects(
		completeJob({ $i, jobId: job.id, leaseToken: first.lease.token, result: { stale: true }, now: base + 101 }),
		error => error.code === 'JOB_LEASE_TOKEN_INVALID'
	);
});

test('retry backs off and max attempts dead-letter the job', async t => {
	const $i = context(t, 'awts-job-retry-');
	const { job } = await submitJob({
		$i,
		type: 'flaky',
		idempotencyKey: 'retry-1',
		maxAttempts: 2,
		payload: {}
	});
	const base = job.availableAt;
	const first = await claimJob({ $i, jobId: job.id, now: base });
	const retry = await failJob({
		$i,
		jobId: job.id,
		leaseToken: first.lease.token,
		error: 'temporary',
		now: base + 1
	});
	assert.equal(retry.status, 'queued');
	assert.equal(retry.availableAt, base + 1_001);
	await assert.rejects(
		claimJob({ $i, jobId: job.id, now: base + 500 }),
		error => error.code === 'JOB_NOT_AVAILABLE'
	);
	const second = await claimJob({ $i, jobId: job.id, now: base + 1_100 });
	const dead = await failJob({
		$i,
		jobId: job.id,
		leaseToken: second.lease.token,
		error: 'still failing',
		now: base + 1_101
	});
	assert.equal(dead.status, 'dead');
});

test('cancellation is final and stale running worker cannot settle afterward', async t => {
	const $i = context(t, 'awts-job-cancel-');
	const { job } = await submitJob({ $i, type: 'slow', payload: {} });
	const base = job.availableAt;
	const running = await claimJob({ $i, jobId: job.id, now: base });
	const cancelled = await cancelJob({ $i, jobId: job.id, reason: 'user_cancelled', now: base + 1 });
	assert.equal(cancelled.status, 'cancelled');
	assert.equal(inspectJob($i, job.id).status, 'cancelled');
	await assert.rejects(
		completeJob({ $i, jobId: job.id, leaseToken: running.lease.token, result: null, now: base + 2 }),
		error => error.code === 'JOB_NOT_RUNNING'
	);
});
