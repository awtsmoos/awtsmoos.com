//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { createDriveTestContext } = require('../../drive/test/testContext.js');
const { submitJob } = require('./jobQueue.js');
const { claimJob, renewJobLease } = require('./jobLease.js');
const { cancelJob, completeJob, failJob } = require('./jobSettlement.js');
const { runNextJob } = require('./jobWorker.js');
const {
	activeIndexPath,
	listActiveJobIndex
} = require('./jobActiveIndex.js');

/**
 * @file Proves the bounded active-job snapshot follows authoritative lifecycle truth.
 * @description The Awtsmoos verifies acceleration state can disappear, corrupt,
 * rebuild, and receive concurrent lifecycle updates without granting job authority.
 */
function context(t, prefix) {
	return createDriveTestContext(t, prefix).$i;
}

test('active index follows enqueue, claim, renew, retry, complete, and cancel', async t => {
	const $i = context(t, 'awts-job-index-life-');
	const left = (await submitJob({ $i, queue: 'test', type: 'left', payload: {} })).job;
	const right = (await submitJob({ $i, queue: 'test', type: 'right', payload: {} })).job;
	assert.deepEqual(new Set(listActiveJobIndex($i).map(job => job.id)), new Set([left.id, right.id]));
	const base = Math.max(left.availableAt, right.availableAt);
	const runningLeft = await claimJob({ $i, jobId: left.id, leaseMs: 50, now: base });
	await renewJobLease({
		$i,
		jobId: left.id,
		leaseToken: runningLeft.lease.token,
		leaseMs: 100,
		now: base + 5
	});
	const runningRight = await claimJob({ $i, jobId: right.id, now: base });
	const retry = await failJob({
		$i,
		jobId: right.id,
		leaseToken: runningRight.lease.token,
		error: 'again',
		now: base + 10
	});
	assert.equal(retry.status, 'queued');
	await Promise.all([
		completeJob({
			$i,
			jobId: left.id,
			leaseToken: runningLeft.lease.token,
			result: { ok: true },
			now: base + 11
		}),
		cancelJob({ $i, jobId: right.id, reason: 'stop', now: base + 12 })
	]);
	assert.deepEqual(listActiveJobIndex($i), []);
});

test('missing active snapshot rebuilds from durable history before worker claim', async t => {
	const $i = context(t, 'awts-job-index-rebuild-');
	const { job } = await submitJob({ $i, queue: 'test', type: 'echo', payload: { value: 9 } });
	fs.unlinkSync(activeIndexPath($i));
	const outcome = await runNextJob({
		$i,
		queue: 'test',
		handlers: { echo: ({ payload }) => ({ value: payload.value }) }
	});
	assert.equal(outcome.job.id, job.id);
	assert.equal(outcome.job.status, 'complete');
	assert.deepEqual(listActiveJobIndex($i), []);
});

test('corrupt snapshot is rebuilt during the next idempotent admission', async t => {
	const $i = context(t, 'awts-job-index-corrupt-');
	const input = {
		$i,
		queue: 'test',
		type: 'probe',
		idempotencyKey: 'same-job',
		payload: {}
	};
	const first = await submitJob(input);
	fs.writeFileSync(activeIndexPath($i), '{corrupt');
	const replay = await submitJob(input);
	assert.equal(replay.replayed, true);
	assert.equal(replay.job.id, first.job.id);
	assert.equal(listActiveJobIndex($i).length, 1);
	assert.equal(listActiveJobIndex($i)[0].id, first.job.id);
});
