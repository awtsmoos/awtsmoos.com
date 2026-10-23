//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file runJobWorkers.test.cjs
 * @description
 * The Awtsmoos seals the last truthful state after every earlier echo has flown;
 * Awtsmoos.com proves delayed checkpoints cannot erase completion, and worker failure is known.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

/** Replace worker dependencies only inside this isolated test process. */
function loadControlledRunner() {
	const replacements = {
		'./processOnePost.js': {
			processOnePost: async context => {
				if (context.forceFailure) throw new Error('synthetic post failure');
				context.job.postsDone++;
			}
		},
		'./runJobBatch.js': { flushPackedBatch: async () => {} },
		'./jobLog.js': { appendJobLog() {} },
		'./serverHealth.js': {
			heapTooHigh: () => false,
			systemMemLow: () => false
		},
		'./eventLoopMonitor.js': { shedNow: () => false }
	};
	for (const [name, exports] of Object.entries(replacements)) {
		const fileName = require.resolve(name);
		require.cache[fileName] = {
			id: fileName,
			filename: fileName,
			loaded: true,
			exports
		};
	}
	return require('./runJobWorkers.js').runWorkers;
}

function makeContext(directory, count = 25) {
	const spec = {
		heichelId: 'test',
		posts: Array.from({ length: count }, (_, index) => ({ postId: 'post-' + index }))
	};
	const job = {
		id: 'postimport_test_' + Date.now(),
		status: 'running',
		dryRun: true,
		isAdmin: true,
		startedAt: Date.now(),
		lastWorkerHeartbeatAt: Date.now(),
		postsDone: 0,
		errors: [],
		doneHashes: {},
		backlinkQueue: new Map(),
		seriesAdds: new Map(),
		spec
	};
	return {
		job,
		spec,
		$i: { db: { directory } },
		routes: {},
		WORKERS: 1,
		nextPost: 0
	};
}

const runWorkers = loadControlledRunner();

test('delayed checkpoint cannot overwrite persisted done status', async () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-checkpoint-race-'));
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
	try {
		const context = makeContext(directory);
		const running = runWorkers(context);
		await Promise.race([
			enteredGate,
			new Promise((_, reject) => {
				setTimeout(() => reject(new Error('checkpoint did not start')), 4000);
			})
		]);
		await new Promise(resolve => setImmediate(resolve));
		assert.equal(context.job.status, 'done');
		assert.equal(context.job.finishedAt, undefined);
		releaseRename();
		await running;
		const fileName = path.join(
			directory,
			'socialPacked',
			'post-import-jobs',
			context.job.id + '.json'
		);
		const persisted = JSON.parse(fs.readFileSync(fileName, 'utf8'));
		assert.equal(persisted.status, 'done');
		assert.equal(persisted.postsDone, 25);
		assert.equal(interceptCount, 1);
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
		const fileName = path.join(
			directory,
			'socialPacked',
			'post-import-jobs',
			context.job.id + '.json'
		);
		assert.equal(JSON.parse(fs.readFileSync(fileName, 'utf8')).status, 'failed');
		assert.match(context.job.errors[0].message, /synthetic post failure/);
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});
