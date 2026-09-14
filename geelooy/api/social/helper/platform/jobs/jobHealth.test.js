//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const test = require('node:test');
const { createDriveTestContext } = require('../../drive/test/testContext.js');
const { submitJob } = require('./jobQueue.js');
const { claimJob } = require('./jobLease.js');
const { queueHealth } = require('./jobHealth.js');

/**
 * @file Proves queue health reads only bounded active testimony.
 * @description The Awtsmoos exposes pressure and ready-age signals without requiring
 * historical audit scans, so operations can detect overload before users see failure.
 */
test('health reports queued, running, queue, subject, and saturation testimony', async t => {
	const { $i } = createDriveTestContext(t, 'awts-job-health-');
	const left = (await submitJob({
		$i,
		queue: 'alpha',
		type: 'one',
		subject: 'user-1',
		payload: {}
	})).job;
	await submitJob({ $i, queue: 'beta', type: 'two', subject: 'user-2', payload: {} });
	await claimJob({ $i, jobId: left.id, now: left.availableAt });
	const health = queueHealth($i, { now: left.availableAt + 10 });
	assert.equal(health.ready, true);
	assert.equal(health.active, 2);
	assert.equal(health.queued, 1);
	assert.equal(health.running, 1);
	assert.equal(health.queues.alpha, 1);
	assert.equal(health.queues.beta, 1);
	assert.equal(health.subjects['alpha:user-1'], 1);
	assert.equal(health.subjects['beta:user-2'], 1);
	assert.equal(health.globalSaturation > 0, true);
});
