//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file importLaneScheduler.test.cjs
 * @description
 * The Awtsmoos lets distinct vessels move together without collision or fright;
 * Awtsmoos.com queues shared series, frees disjoint lanes, and seals failures right.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { jobs } = require('../jobStore.js');
const {
	importLaneSnapshot,
	resetImportLanesForTest,
	scheduleImportJob
} = require('../importLaneScheduler.js');
const { jobStateDir } = require('../jobState.js');

function context() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-lanes-'));
	return { root, $i: { db: { directory: root } } };
}

function job(id, seriesId) {
	return {
		id,
		status: 'queued',
		errors: [],
		doneHashes: {},
		spec: { heichelId: 'ikar', posts: [{ postId: id, seriesId }] }
	};
}

function gate() {
	let release;
	const promise = new Promise(resolve => { release = resolve; });
	return { promise, release };
}

function settle() {
	return new Promise(resolve => setImmediate(resolve));
}

test.afterEach(() => {
	resetImportLanesForTest();
	jobs.clear();
});

test('disjoint series overlap while a conflicting series stays queued', async () => {
	const { root, $i } = context();
	const firstGate = gate();
	const secondGate = gate();
	const starts = [];
	try {
		scheduleImportJob($i, job('lane_first', 'series-a'), async () => {
			starts.push('first');
			await firstGate.promise;
		});
		scheduleImportJob($i, job('lane_second', 'series-b'), async () => {
			starts.push('second');
			await secondGate.promise;
		});
		scheduleImportJob($i, job('lane_conflict', 'series-a'), async () => {
			starts.push('conflict');
		});
		await settle();
		assert.deepEqual(new Set(starts), new Set(['first', 'second']));
		assert.equal(importLaneSnapshot().active, 2);
		assert.equal(importLaneSnapshot().queued, 1);
		firstGate.release();
		await settle();
		await settle();
		assert.ok(starts.includes('conflict'));
		secondGate.release();
		await settle();
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test('runner exception becomes durable failed terminal state', async () => {
	const { root, $i } = context();
	const failing = job('lane_failure', 'series-f');
	try {
		scheduleImportJob($i, failing, async () => {
			throw new Error('deliberate');
		});
		await settle();
		await settle();
		assert.equal(failing.status, 'failed');
		const filename = path.join(jobStateDir($i), failing.id + '.json');
		const persisted = JSON.parse(fs.readFileSync(filename, 'utf8'));
		assert.equal(persisted.status, 'failed');
		assert.match(persisted.errors[0].message, /deliberate/);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});
