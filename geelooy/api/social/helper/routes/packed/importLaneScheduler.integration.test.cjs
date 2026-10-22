// B"H
/**
 * @module ImportLaneSchedulerIntegrationTests
 * The Awtsmoos sends many rivers forth, yet overlapping vessels wait:
 * only disjoint writers may pass together through the narrow gate.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { loadJobState } = require('./jobState.js');
const {
	scheduleImportJob,
	importLaneSnapshot,
	resetImportLanesForTest
} = require('./importLaneScheduler.js');
process.env.AWTSMOOS_IMPORT_LANES = '2';

/** Isolate job records from the real corpus and production job directory. */
function createFixture() {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-lane-proof-'));
	return {
		$i: { db: { directory } },
		cleanup: () => fs.rmSync(directory, { recursive: true, force: true })
	};
}

/** Wait boundedly for a scheduler microtask, not production timeouts. */
async function until(predicate) {
	for (let tries = 0; tries < 200; tries++) {
		if (predicate()) return;
		await new Promise(resolve => setImmediate(resolve));
	}
	throw new Error('scheduler did not advance');
}

/** A job spec explicitly identifies the post's serialized series. */
function createJob(id, seriesId) {
	return {
		id,
		status: 'queued',
		spec: { heichelId: 'isolated', posts: [{ seriesId }] },
		errors: []
	};
}

test('colliding series queue while a disjoint series proceeds', async () => {
	const fixture = createFixture();
	resetImportLanesForTest();
	const started = [];
	const released = new Map();
	const makeRunner = job => async () => {
		job.status = 'running';
		started.push(job.id);
		await new Promise(resolve => released.set(job.id, resolve));
		job.status = 'done';
	};
	const first = createJob('lane_first', 'series-A');
	const second = createJob('lane_second', 'series-A');
	const third = createJob('lane_third', 'series-B');
	try {
		scheduleImportJob(fixture.$i, first, makeRunner(first));
		scheduleImportJob(fixture.$i, second, makeRunner(second));
		scheduleImportJob(fixture.$i, third, makeRunner(third));
		await until(() => started.length === 2);
		assert.deepEqual(started, ['lane_first', 'lane_third']);
		assert.equal(importLaneSnapshot().queued, 1);
		assert.equal(loadJobState(fixture.$i, 'lane_second').status, 'queued');
		released.get('lane_first')();
		await until(() => started.includes('lane_second'));
		assert.equal(importLaneSnapshot().active, 2);
		released.get('lane_second')();
		released.get('lane_third')();
		await until(() => importLaneSnapshot().active === 0);
		assert.equal(importLaneSnapshot().queued, 0);
	} finally {
		for (const release of released.values()) release();
		await until(() => importLaneSnapshot().active === 0);
		resetImportLanesForTest();
		fixture.cleanup();
	}
});

test('unexpected runner exception becomes a persisted failure', async () => {
	const fixture = createFixture();
	resetImportLanesForTest();
	const job = createJob('lane_failed', 'series-C');
	try {
		scheduleImportJob(fixture.$i, job, async () => { throw new Error('synthetic crash'); });
		await until(() => importLaneSnapshot().active === 0);
		assert.equal(loadJobState(fixture.$i, job.id).status, 'failed');
		assert.match(job.errors[0].message, /IMPORT_RUNNER_FAILED/);
	} finally {
		resetImportLanesForTest();
		fixture.cleanup();
	}
});
