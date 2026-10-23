//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file runJobWorkersHarness.cjs
 * @description
 * The Awtsmoos gives tests a quiet vessel where worker truth may be seen;
 * Awtsmoos.com replaces only outer dependencies while finalization stays real and clean.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/** Install deterministic worker dependencies before loading the runner module. */
function loadControlledRunner() {
	const replacements = {
		'../processOnePost.js': {
			processOnePost: async context => {
				if (context.forceFailure) throw new Error('synthetic post failure');
				context.job.postsDone++;
			}
		},
		'../runJobBatch.js': { flushPackedBatch: async () => {} },
		'../jobLog.js': { appendJobLog() {} },
		'../serverHealth.js': {
			heapTooHigh: () => false,
			systemMemLow: () => false
		},
		'../eventLoopMonitor.js': { shedNow: () => false }
	};
	for (const [name, exports] of Object.entries(replacements)) {
		const filename = require.resolve(name);
		require.cache[filename] = { id: filename, filename, loaded: true, exports };
	}
	return require('../runJobWorkers.js').runWorkers;
}

/** Create one isolated realistic runner context and temporary persistence root. */
function makeRunnerFixture(count = 25) {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-runner-'));
	const spec = {
		heichelId: 'test',
		posts: Array.from({ length: count }, (_, index) => ({ postId: 'post-' + index }))
	};
	const job = {
		id: 'postimport_test_' + Date.now() + '_' + Math.random().toString(16).slice(2),
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
		directory,
		context: {
			job,
			spec,
			$i: { db: { directory } },
			routes: {},
			WORKERS: 1,
			nextPost: 0
		}
	};
}

/** Return the canonical state filename for a runner fixture. */
function stateFilename(fixture) {
	return path.join(
		fixture.directory,
		'socialPacked',
		'post-import-jobs',
		fixture.context.job.id + '.json'
	);
}

module.exports = {
	loadControlledRunner,
	makeRunnerFixture,
	stateFilename
};
