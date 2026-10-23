//B"H
/**
 * @file runJobWorkers.test.cjs
 * @description The Awtsmoos orders the seasons of async work;
 * a bounded state transition, not one scheduler turn, proves completion.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

/** Protect real I/O: inject deterministic post-processing and logging. */
function controlledRunner() {
	const doubles = {
		'./processOnePost.js': { processOnePost: async context => {
			if (context.forceFailure) throw new Error('synthetic post failure');
			context.job.postsDone++;
		} },
		'./runJobBatch.js': { flushPackedBatch: async () => {} },
		'./jobLog.js': { appendJobLog() {} },
		'./serverHealth.js': { heapTooHigh: () => false, systemMemLow: () => false },
		'./eventLoopMonitor.js': { shedNow: () => false }
	};
	for (const [name, exports] of Object.entries(doubles)) {
		const fileName = require.resolve(name);
		require.cache[fileName] = { id: fileName, filename: fileName, loaded: true, exports };
	}
	return require('./runJobWorkers.js').runWorkers;
}

/** Isolate every job state from public storage and credentials. */
function makeContext(directory, count = 25) {
	const spec = { heichelId: 'test', posts: Array.from({ length: count },
		(_, index) => ({ postId: `post-${index}` })) };
	const job = {
		id: `postimport_test_${Date.now()}`, status: 'running',
		dryRun: true, isAdmin: true, startedAt: Date.now(),
		lastWorkerHeartbeatAt: Date.now(), postsDone: 0, errors: [],
		doneHashes: {}, backlinkQueue: new Map(), seriesAdds: new Map(), spec
	};
	return { job, spec, $i: { db: { directory } }, routes: {}, WORKERS: 1, nextPost: 0 };
}

/** Wait for evidence of progress without assuming event-loop tick order. */
async function until(predicate, timeoutMs = 4000) {
	const deadline = Date.now() + timeoutMs;
	while (!predicate()) {
		if (Date.now() >= deadline) throw new Error('worker did not reach expected state');
		await new Promise(resolve => setImmediate(resolve));
	}
}

const runWorkers = controlledRunner();

test('delayed checkpoint cannot overwrite persisted done status', async () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-checkpoint-race-'));
	const originalRename = fs.promises.rename;
	let releaseRename;
	let signalRename;
	const released = new Promise(resolve => { releaseRename = resolve; });
	const entered = new Promise(resolve => { signalRename = resolve; });
	let intercepted = 0;
	fs.promises.rename = async (from, to) => {
		if (String(from).endsWith('.json.ckptmp')) {
			intercepted++;
			signalRename();
			await released;
		}
		return originalRename(from, to);
	};
	try {
		const context = makeContext(directory);
		const running = runWorkers(context);
		await Promise.race([entered, new Promise((_, reject) => {
			setTimeout(() => reject(new Error('checkpoint did not start')), 4000);
		})]);
		await until(() => context.job.status === 'done');
		assert.equal(context.job.finishedAt, undefined);
		releaseRename();
		await running;
		const stored = JSON.parse(fs.readFileSync(path.join(directory,
			'socialPacked', 'post-import-jobs', `${context.job.id}.json`), 'utf8'));
		assert.equal(stored.status, 'done');
		assert.equal(stored.postsDone, 25);
		assert.equal(intercepted, 1);
	} finally {
		releaseRename();
		fs.promises.rename = originalRename;
		fs.rmSync(directory, { recursive: true, force: true });
	}
});

test('worker exceptions persist failed terminal status', async () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-checkpoint-failed-'));
	try {
		const context = makeContext(directory, 1);
		context.forceFailure = true;
		await runWorkers(context);
		const stored = JSON.parse(fs.readFileSync(path.join(directory,
			'socialPacked', 'post-import-jobs', `${context.job.id}.json`), 'utf8'));
		assert.equal(stored.status, 'failed');
		assert.match(context.job.errors[0].message, /synthetic post failure/);
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});
