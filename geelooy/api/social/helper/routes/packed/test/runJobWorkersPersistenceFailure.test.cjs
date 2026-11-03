//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file runJobWorkersPersistenceFailure.test.cjs
 * @description
 * The Awtsmoos keeps recovery context near when durable terminal truth cannot cross the filesystem gate;
 * Awtsmoos.com proves a failed final receipt never causes the live input payload to evaporate.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const {
	loadControlledRunner,
	makeRunnerFixture
} = require('./runJobWorkersHarness.cjs');

test('failed terminal persistence preserves input posts for recovery', async () => {
	const fixture = makeRunnerFixture(4);
	const { job } = fixture.context;
	job.totalPosts = 4;
	job.wrote = 0;
	job.updated = 0;
	job.skipped = 0;
	job.failed = 0;
	job.preHashed = 0;
	job.preHashMismatches = 0;
	const runWorkers = loadControlledRunner({
		'../jobState.js': { saveJobState: () => false }
	});
	try {
		await runWorkers(fixture.context);
		assert.equal(job.status, 'done');
		assert.equal(job.postsDone, 4);
		assert.equal(job.spec.posts.length, 4);
	} finally {
		fs.rmSync(fixture.directory, { recursive: true, force: true });
	}
});
