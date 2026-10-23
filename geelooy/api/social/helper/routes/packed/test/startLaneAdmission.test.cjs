//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file startLaneAdmission.test.cjs
 * @description
 * The Awtsmoos receives rightful work before a lane is free to shine;
 * Awtsmoos.com accepts two same-series admin jobs, then runs them one at a time.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const startMixin = require('../startMixin.js');
const { jobs } = require('../jobStore.js');
const { saveJobState, jobStateDir } = require('../jobState.js');
const {
	importLaneSnapshot,
	resetImportLanesForTest
} = require('../importLaneScheduler.js');

function gate() {
	let release;
	const promise = new Promise(resolve => { release = resolve; });
	return { promise, release };
}

function settle() {
	return new Promise(resolve => setImmediate(resolve));
}

function route(root, firstGate, secondGate, starts) {
	let runIndex = 0;
	return {
		...startMixin,
		$i: {
			request: { method: 'POST' },
			$_POST: {},
			$_GET: {},
			headers: {},
			db: { directory: root }
		},
		checkAuthDetailed() {
			return { caller: { identity: 'admin-test', isAdmin: true } };
		},
		async runJob($i, job) {
			const index = runIndex++;
			starts.push(job.id);
			job.status = 'running';
			saveJobState($i, job);
			await (index === 0 ? firstGate.promise : secondGate.promise);
			job.status = 'done';
			job.finishedAt = Date.now();
			saveJobState($i, job);
		}
	};
}

function post(postId) {
	return { postId, seriesId: 'same-series', title: postId, content: 'test' };
}

test.afterEach(() => {
	resetImportLanesForTest();
	jobs.clear();
});

test('two same-series admin starts are both accepted and the second waits in queue', async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-start-lane-'));
	const firstGate = gate();
	const secondGate = gate();
	const starts = [];
	const subject = route(root, firstGate, secondGate, starts);
	try {
		subject.$i.$_POST = { heichelId: 'ikar', posts: [post('lane-route-first')] };
		const first = await subject.start();
		await settle();
		assert.ok(first.success?.jobId);
		assert.equal(importLaneSnapshot().active, 1);

		subject.$i.$_POST = { heichelId: 'ikar', posts: [post('lane-route-second')] };
		const second = await subject.start();
		await settle();
		assert.ok(second.success?.jobId);
		assert.equal(importLaneSnapshot().active, 1);
		assert.equal(importLaneSnapshot().queued, 1);
		assert.equal(starts.length, 1);
		const queuedFile = path.join(jobStateDir(subject.$i), second.success.jobId + '.json');
		assert.equal(JSON.parse(fs.readFileSync(queuedFile, 'utf8')).status, 'queued');

		firstGate.release();
		await settle();
		await settle();
		assert.equal(starts.length, 2);
		assert.ok(starts.includes(second.success.jobId));
		secondGate.release();
		await settle();
		await settle();
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});
