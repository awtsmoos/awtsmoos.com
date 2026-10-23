//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file runJobBackpressure.test.cjs
 * @description
 * The Awtsmoos makes gevurah a vessel for flow, not a decree to discard the light;
 * Awtsmoos.com waits under pressure while accepted jobs remain running and right.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { waitForImportPressure } = require('../runJobBackpressure.js');

function runningJob() {
	return {
		status: 'running',
		memoryWaits: 0,
		shedPauses: 0,
		lastWorkerHeartbeatAt: 0
	};
}

test('memory pressure yields without pausing or failing accepted work', async () => {
	const job = runningJob();
	let waited = 0;
	const pressured = await waitForImportPressure(job, {
		heapTooHigh: () => true,
		systemMemLow: () => false,
		shedNow: () => false,
		sleep: async milliseconds => { waited = milliseconds; }
	});
	assert.equal(pressured, true);
	assert.equal(job.status, 'running');
	assert.equal(job.memoryWaits, 1);
	assert.equal(waited, 500);
	assert.ok(job.lastWorkerHeartbeatAt > 0);
});

test('event-loop pressure yields without changing terminal semantics', async () => {
	const job = runningJob();
	let waited = 0;
	const pressured = await waitForImportPressure(job, {
		heapTooHigh: () => false,
		systemMemLow: () => false,
		shedNow: () => true,
		sleep: async milliseconds => { waited = milliseconds; }
	});
	assert.equal(pressured, true);
	assert.equal(job.status, 'running');
	assert.equal(job.shedPauses, 1);
	assert.equal(waited, 250);
});

test('healthy pressure state lets the worker continue immediately', async () => {
	const job = runningJob();
	const pressured = await waitForImportPressure(job, {
		heapTooHigh: () => false,
		systemMemLow: () => false,
		shedNow: () => false,
		sleep: async () => { throw new Error('sleep should not run'); }
	});
	assert.equal(pressured, false);
	assert.equal(job.status, 'running');
});
