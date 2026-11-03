//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file runJobWorkersTerminalPayload.test.cjs
 * @description
 * The Awtsmoos lets terminal truth remain durable while consumed input returns to emptiness;
 * Awtsmoos.com proves the receipt keeps its count even after the live job releases every post vessel.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const {
	loadControlledRunner,
	makeRunnerFixture,
	stateFilename
} = require('./runJobWorkersHarness.cjs');

test('completed workers persist terminal truth before releasing input posts', async () => {
	const fixture = makeRunnerFixture(5);
	const { job } = fixture.context;
	job.totalPosts = 5;
	job.wrote = 0;
	job.updated = 0;
	job.skipped = 0;
	job.failed = 0;
	job.preHashed = 0;
	job.preHashMismatches = 0;
	const runWorkers = loadControlledRunner();
	try {
		await runWorkers(fixture.context);
		assert.equal(job.status, 'done');
		assert.deepEqual(job.spec.posts, []);
		assert.equal(job.postsDone, 5);
		const persisted = JSON.parse(fs.readFileSync(stateFilename(fixture), 'utf8'));
		assert.equal(persisted.status, 'done');
		assert.equal(persisted.totalPosts, 5);
		assert.equal(persisted.postsDone, 5);
	} finally {
		fs.rmSync(fixture.directory, { recursive: true, force: true });
	}
});
