// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file librarySearchAdmission.test.js
 * @description
 * Iteration 6 put the all-libraries VECTOR fan-out under admission control
 * after unbounded concurrent semantic searches (each fanning out to every
 * lane and index part) OOM-killed the production service mid-battery.
 * These tests pin the contract: at most MAX searches run at once, queued
 * waiters are admitted FIFO as slots free, a waiter whose own deadline
 * passes is refused with a typed SEARCH_BUSY error, and non-vector
 * strategies bypass admission entirely.
 */

const assert = require('node:assert/strict');
const test = require('node:test');

const {
	MAX_CONCURRENT_VECTOR_SEARCHES,
	acquire,
	admissionSnapshot,
	withLibrarySearchAdmission
} = require('../librarySearchAdmission.js');

test('admission caps concurrency and hands slots to waiters in order', async () => {
	const deadline = Date.now() + 5000;
	const releases = [];
	for (let index = 0; index < MAX_CONCURRENT_VECTOR_SEARCHES; index += 1) {
		releases.push(await acquire(deadline));
	}
	assert.equal(admissionSnapshot().active, MAX_CONCURRENT_VECTOR_SEARCHES);

	const admitted = [];
	const waiterOne = acquire(deadline).then(release => { admitted.push(1); return release; });
	const waiterTwo = acquire(deadline).then(release => { admitted.push(2); return release; });
	await new Promise(resolve => setTimeout(resolve, 25));
	assert.deepEqual(admitted, []);
	assert.equal(admissionSnapshot().waiting, 2);

	releases[0]();
	const releaseOne = await waiterOne;
	assert.deepEqual(admitted, [1]);
	assert.equal(admissionSnapshot().active, MAX_CONCURRENT_VECTOR_SEARCHES);

	releases[1]();
	const releaseTwo = await waiterTwo;
	assert.deepEqual(admitted, [1, 2]);
	releaseOne();
	releaseTwo();
	assert.deepEqual(admissionSnapshot(), {
		active: 0,
		waiting: 0,
		max: MAX_CONCURRENT_VECTOR_SEARCHES
	});
});

test('a waiter whose deadline passes is refused with SEARCH_BUSY', async () => {
	const deadline = Date.now() + 5000;
	const releases = [];
	for (let index = 0; index < MAX_CONCURRENT_VECTOR_SEARCHES; index += 1) {
		releases.push(await acquire(deadline));
	}
	await assert.rejects(
		acquire(Date.now() + 30),
		error => error && error.code === 'SEARCH_BUSY'
	);
	// An already-expired deadline is refused immediately, even with a slot free later.
	await assert.rejects(
		acquire(Date.now() - 1),
		error => error && error.code === 'SEARCH_BUSY'
	);
	for (const release of releases) release();
	assert.equal(admissionSnapshot().active, 0);
});

test('double release does not corrupt the active count', async () => {
	const release = await acquire(Date.now() + 5000);
	release();
	release();
	assert.equal(admissionSnapshot().active, 0);
});

test('withLibrarySearchAdmission passes non-vector strategies straight through', async () => {
	let ran = 0;
	const run = async () => { ran += 1; return 'ok'; };
	assert.equal(await withLibrarySearchAdmission({ strategy: 'text' }, Date.now() + 1000, run), 'ok');
	assert.equal(await withLibrarySearchAdmission({ strategy: 'vector' }, Date.now() + 1000, run), 'ok');
	assert.equal(ran, 2);
	assert.equal(admissionSnapshot().active, 0);
});
