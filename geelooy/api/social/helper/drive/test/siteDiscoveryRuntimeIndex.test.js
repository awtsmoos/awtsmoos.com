//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { createDriveTestContext } = require('./testContext.js');
const { submitJob } = require('../../platform/jobs/jobQueue.js');
const {
	activeIndexPath,
	listActiveJobIndex
} = require('../../platform/jobs/jobActiveIndex.js');
const { startSiteDiscoveryRuntime } = require('../siteDiscoveryRuntime.js');

/**
 * @file Proves process startup rebuilds disposable active-job acceleration.
 * @description The Awtsmoos restores active job visibility from durable history
 * before ordinary background draining, without requiring HTTP readiness to wait.
 */
async function waitForIndex($i, jobId, timeoutMs = 1_500) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		const jobs = listActiveJobIndex($i) || [];
		if (jobs.some(job => job.id === jobId)) return true;
		await new Promise(resolve => setTimeout(resolve, 20));
	}
	return false;
}

test('runtime boot rebuilds a missing active index from durable jobs', async t => {
	const { $i } = createDriveTestContext(t, 'awts-runtime-index-');
	const { job } = await submitJob({
		$i,
		queue: 'other',
		type: 'probe',
		idempotencyKey: 'boot-rebuild',
		payload: {}
	});
	fs.unlinkSync(activeIndexPath($i));
	assert.equal(listActiveJobIndex($i), null);
	const runtime = startSiteDiscoveryRuntime({
		db: $i.db,
		drainMs: 500,
		reconcileMs: 500,
		aliasSource: { count: async () => 0, list: async () => [] }
	});
	assert.equal(await waitForIndex($i, job.id), true);
	runtime.stop();
});
