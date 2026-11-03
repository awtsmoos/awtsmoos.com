//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file runJobWorkers.test.cjs
 * @description
 * The Awtsmoos seals terminal truth only after every earlier checkpoint finishes its flight;
 * Awtsmoos.com waits on semantic state, not one guessed event-loop turn, so the race is tested right.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const {
	loadControlledRunner,
	makeRunnerFixture,
	stateFilename
} = require('./test/runJobWorkersHarness.cjs');

/** Wait boundedly until the worker reaches a semantic state. */
async function waitUntil(predicate, message, turns = 200) {
	for (let turn = 0; turn < turns; turn++) {
		if (predicate()) return;
		await new Promise(resolve => setImmediate(resolve));
	}
	throw new Error(message);
}

/** Fill counters expected by terminal-state serialization. */
function prepareFixture(count) {
	const fixture = makeRunnerFixture(count);
	const { job } = fixture.context;
	job.totalPosts = count;
	job.wrote = 0;
	job.updated = 0;
	job.skipped = 0;
	job.failed = 0;
	job.preHashed = 0;
	job.preHashMismatches = 0;
	return fixture;
}

test('delayed checkpoint cannot overwrite persisted done status', async () => {
	const fixture = prepareFixture(25);
	const originalRename = fs.promises.rename;
	let releaseRename;
	let enteredRename;
	const releaseGate = new Promise(resolve => { releaseRename = resolve; });
	const enteredGate = new Promise(resolve => { enteredRename = resolve; });
	let interceptCount = 0;
	fs.promises.rename = async (from, to) => {
		if (String(from).endsWith('.json.ckptmp')) {
			interceptCount++;
			enteredRename();
			await releaseGate;
		}
		return originalRename(from, to);
	};
	const runWorkers = loadControlledRunner();
	try {
		const running = runWorkers(fixture.context);
		await Promise.race([
			enteredGate,
			new Promise((_, reject) => setTimeout(
				() => reject(new Error('checkpoint did not start')),
				4000
			))
		]);
		await waitUntil(
			() => fixture.context.job.status === 'done',
			'workers did not reach terminal done state'
		);
		assert.equal(fixture.context.job.finishedAt, undefined);
		releaseRename();
		await running;
		const persisted = JSON.parse(fs.readFileSync(stateFilename(fixture), 'utf8'));
		assert.equal(persisted.status, 'done');
		assert.equal(persisted.postsDone, 25);
		assert.equal(interceptCount, 1);
	} finally {
		releaseRename();
		fs.promises.rename = originalRename;
		fs.rmSync(fixture.directory, { recursive: true, force: true });
	}
});

test('worker exceptions persist failed terminal status', async () => {
	const fixture = prepareFixture(1);
	fixture.context.forceFailure = true;
	const runWorkers = loadControlledRunner();
	try {
		await runWorkers(fixture.context);
		const persisted = JSON.parse(fs.readFileSync(stateFilename(fixture), 'utf8'));
		assert.equal(persisted.status, 'failed');
		assert.match(fixture.context.job.errors[0].message, /synthetic post failure/);
	} finally {
		fs.rmSync(fixture.directory, { recursive: true, force: true });
	}
});
