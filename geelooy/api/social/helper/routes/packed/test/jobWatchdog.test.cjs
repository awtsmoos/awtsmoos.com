//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file jobWatchdog.test.cjs
 * @description
 * The Awtsmoos is beyond elapsed hours while a finite worker must still reveal a beat;
 * Awtsmoos.com never time-limits admin motion, yet stale motion receives durable defeat.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { jobBudgetExceeded, workerHeartbeatStale } = require('../jobWatchdogPolicy.js');
const { watchdogTick } = require('../jobWatchdog.js');
const { jobStateDir } = require('../jobState.js');

function context() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-watchdog-'));
	return { root, $i: { db: { directory: root } } };
}

function runningJob(id, isAdmin) {
	return {
		id,
		isAdmin,
		status: 'running',
		startedAt: 1000,
		lastWorkerHeartbeatAt: 1000,
		timeBudgetMs: 100,
		postsDone: 0,
		errors: [],
		doneHashes: {},
		spec: { heichelId: 'ikar', posts: [] }
	};
}

test('admin elapsed wall-clock age never exceeds an execution budget', () => {
	const job = runningJob('watchdog_admin_time', true);
	assert.equal(jobBudgetExceeded(job, 1000 + 7 * 24 * 60 * 60 * 1000), false);
});

test('non-admin elapsed work retains the centralized compatibility budget', () => {
	const job = runningJob('watchdog_user_time', false);
	assert.equal(jobBudgetExceeded(job, 1200), true);
});

test('worker heartbeat staleness remains independent of admin wall-clock freedom', () => {
	const job = runningJob('watchdog_heartbeat', true);
	assert.equal(workerHeartbeatStale(job, 1000 + 300000), true);
});

test('stale admin heartbeat is durably terminalized as failed', async () => {
	const { root, $i } = context();
	const job = runningJob('watchdog_durable', true);
	try {
		const alive = await watchdogTick($i, job, 1000 + 300000);
		assert.equal(alive, false);
		assert.equal(job.status, 'failed');
		const filename = path.join(jobStateDir($i), job.id + '.json');
		const persisted = JSON.parse(fs.readFileSync(filename, 'utf8'));
		assert.equal(persisted.status, 'failed');
		assert.match(persisted.errors[0].message, /STALE_HEARTBEAT/);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});
