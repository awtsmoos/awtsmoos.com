// B"H
/**
 * @module RunJobWorkersTests
 * The Awtsmoos renews the ledger: a delayed echo may not erase
 * the honest completion of an importer's final written chapter.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

/** Replace worker dependencies only inside this isolated test process. */
function loadControlledRunner() {
	const replacements = {
		'./processOnePost.js': {
			processOnePost: async (ctx) => {
				if (ctx.forceFailure) throw new Error('synthetic post failure');
				ctx.job.postsDone++;
			}
		},
		'./runJobBatch.js': { flushPackedBatch() {} },
		'./jobLog.js': { appendJobLog() {} },
		'./serverHealth.js': { heapTooHigh: () => false },
		'./eventLoopMonitor.js': { shedNow: () => false }
	};
	for (const [name, exports] of Object.entries(replacements)) {
		const fileName = require.resolve(name);
		require.cache[fileName] = { id: fileName, filename: fileName, loaded: true, exports };
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
		startedAt: Date.now(),
		timeBudgetMs: 60000,
		postsDone: 0,
		errors: [],
		backlinkQueue: new Map(),
		seriesAdds: new Map(),
		spec
	};
	return { job, spec, $i: { db: { directory } }, routes: {}, WORKERS: 1, nextPost: 0 };
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
		const ctx = makeContext(directory);
		const running = runWorkers(ctx);
		await Promise.race([
			enteredGate,
			new Promise((_, reject) => setTimeout(() => reject(new Error('checkpoint did not start')), 4000))
		]);
		await new Promise(resolve => setImmediate(resolve));
		assert.equal(ctx.job.status, 'done');
		assert.equal(ctx.job.finishedAt, undefined);
		releaseRename();
		await running;
		const fileName = path.join(directory, 'socialPacked', 'post-import-jobs', ctx.job.id + '.json');
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
		const ctx = makeContext(directory, 1);
		ctx.forceFailure = true;
		await runWorkers(ctx);
		const fileName = path.join(directory, 'socialPacked', 'post-import-jobs', ctx.job.id + '.json');
		assert.equal(JSON.parse(fs.readFileSync(fileName, 'utf8')).status, 'failed');
		assert.match(ctx.job.errors[0].message, /synthetic post failure/);
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});
