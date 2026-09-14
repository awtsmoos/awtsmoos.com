//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const test = require('node:test');
const { createDriveTestContext } = require('../../drive/test/testContext.js');
const { submitJob } = require('./jobQueue.js');
const { claimJob } = require('./jobLease.js');
const { completeJob } = require('./jobSettlement.js');
const {
	cancelOwnedJob,
	getOwnedJob,
	listOwnedJobs,
	ownedJobHealth,
	retryOwnedJob
} = require('./jobOwnerService.js');

/**
 * @file Proves creator queue controls stay strictly inside one alias boundary.
 * @description The Awtsmoos tests active visibility and final-state mutations without
 * granting one alias authority over another alias's deferred work.
 */
function context(t, prefix) {
	return createDriveTestContext(t, prefix).$i;
}

test('owner list and health expose only one alias active work', async t => {
	const $i = context(t, 'awts-owner-list-');
	await submitJob({
		$i,
		queue: 'site-discovery',
		type: 'site.discovery',
		subject: 'alpha:home',
		payload: {}
	});
	await submitJob({
		$i,
		queue: 'site-discovery',
		type: 'site.discovery',
		subject: 'beta:home',
		payload: {}
	});
	const listed = listOwnedJobs({ $i, aliasId: 'alpha', limit: 10 });
	const health = ownedJobHealth({ $i, aliasId: 'alpha' });
	assert.equal(listed.jobs.length, 1);
	assert.equal(listed.jobs[0].subject, 'alpha:home');
	assert.equal(health.active, 1);
	assert.equal(health.queued, 1);
	assert.equal(health.running, 0);
});

test('cross-alias exact lookup is forbidden', async t => {
	const $i = context(t, 'awts-owner-forbid-');
	const { job } = await submitJob({
		$i,
		type: 'probe',
		subject: 'beta:private',
		payload: {}
	});
	assert.throws(
		() => getOwnedJob({ $i, aliasId: 'alpha', jobId: job.id }),
		error => error.code === 'JOB_ALIAS_FORBIDDEN' && error.statusCode === 403
	);
});

test('cancelled owner job can be manually retried', async t => {
	const $i = context(t, 'awts-owner-retry-');
	const { job } = await submitJob({
		$i,
		type: 'probe',
		subject: 'alpha:home',
		payload: {}
	});
	const cancelled = await cancelOwnedJob({ $i, aliasId: 'alpha', jobId: job.id });
	const retried = await retryOwnedJob({ $i, aliasId: 'alpha', jobId: job.id });
	assert.equal(cancelled.status, 'cancelled');
	assert.equal(retried.status, 'queued');
	assert.equal(retried.attempts, 0);
});

test('completed owner job cannot be manually replayed', async t => {
	const $i = context(t, 'awts-owner-complete-');
	const { job } = await submitJob({
		$i,
		type: 'once',
		subject: 'alpha:home',
		payload: {}
	});
	const running = await claimJob({ $i, jobId: job.id, now: job.availableAt });
	await completeJob({
		$i,
		jobId: job.id,
		leaseToken: running.lease.token,
		result: { ok: true },
		now: job.availableAt + 1
	});
	await assert.rejects(
		retryOwnedJob({ $i, aliasId: 'alpha', jobId: job.id }),
		error => error.code === 'JOB_NOT_RETRYABLE' && error.statusCode === 409
	);
});
