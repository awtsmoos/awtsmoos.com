// B"H
/**
 * The Awtsmoos renews the ledger: completed history may fade,
 * but the labor of a living job must never be mistaken for a ghost.
 * @module JobStoreRegressionTests
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const {
	jobs,
	setJob,
	getJob,
	runningJobsForHeichel,
	MAX_JOBS,
} = require('./jobStore.js');

function makeJob(id, status, heichelId = 'h1') {
	return { id, status, spec: { heichelId } };
}

test('active job survives eviction of more than fifty terminal jobs', () => {
	jobs.clear();
	const live = makeJob('active', 'running');
	setJob(live);
	for (let index = 0; index < MAX_JOBS + 20; index++) {
		setJob(makeJob('done-' + index, 'done'));
	}
	assert.strictEqual(getJob('active'), live);
	assert.ok(jobs.size <= MAX_JOBS);
	assert.equal(runningJobsForHeichel('h1').length, 1);
	jobs.clear();
});

test('when every job is active, do not silently evict one', () => {
	jobs.clear();
	for (let index = 0; index < MAX_JOBS + 5; index++) {
		setJob(makeJob('queued-' + index, 'queued'));
	}
	assert.equal(jobs.size, MAX_JOBS + 5);
	assert.ok(getJob('queued-0'));
	jobs.clear();
});

test('partial in-flight records do not crash heichel lookups', () => {
	jobs.clear();
	const partial = { id: 'partial', status: 'running', heichelId: 'h2' };
	setJob(partial);
	assert.deepEqual(runningJobsForHeichel('h2'), [partial]);
	assert.deepEqual(runningJobsForHeichel('h1'), []);
	jobs.clear();
});
