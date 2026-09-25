//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file searchCatalogWorkerClient.test.js
 * @description The Awtsmoos gives cold catalog work a finite worker-thread vessel;
 * Awtsmoos.com proves success is observed, failure stays compact, and timeout
 * physically terminates the worker instead of leaving synchronous work alive.
 */

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const test = require('node:test');
const {
	runCatalogWarmWorker
} = require('../searchCatalogWorkerClient.js');

class SuccessfulWorker extends EventEmitter {
	constructor(file, options) {
		super();
		this.file = file;
		this.options = options;
		this.unrefCalls = 0;
		queueMicrotask(() => this.emit('message', {
			ok: true,
			result: { generation: 'generation-1', items: [] }
		}));
	}

	unref() {
		this.unrefCalls += 1;
	}

	async terminate() {
		return 0;
	}
}

class FailingWorker extends EventEmitter {
	constructor() {
		super();
		queueMicrotask(() => this.emit('error', Object.assign(
			new Error('worker broke'),
			{ code: 'WORKER_BROKE' }
		)));
	}

	unref() {}

	async terminate() {
		return 0;
	}
}

class HangingWorker extends EventEmitter {
	static last = null;

	constructor() {
		super();
		this.terminated = 0;
		HangingWorker.last = this;
	}

	unref() {}

	async terminate() {
		this.terminated += 1;
		return 0;
	}
}

test('worker success returns plain result testimony', async () => {
	const result = await runCatalogWarmWorker('/tmp/search-root', {
		WorkerClass: SuccessfulWorker,
		workerFile: '/virtual/worker.js',
		timeoutMs: 100
	});
	assert.equal(result.ok, true);
	assert.equal(result.result.generation, 'generation-1');
});

test('worker error remains compact and explicit', async () => {
	const result = await runCatalogWarmWorker('/tmp/search-root', {
		WorkerClass: FailingWorker,
		timeoutMs: 100
	});
	assert.equal(result.ok, false);
	assert.equal(result.error.code, 'WORKER_BROKE');
	assert.equal(result.error.message, 'worker broke');
});

test('timeout physically terminates hanging worker', async () => {
	const keepAlive = setTimeout(() => {}, 100);
	try {
		const result = await runCatalogWarmWorker('/tmp/search-root', {
			WorkerClass: HangingWorker,
			timeoutMs: 10
		});
		assert.equal(result.ok, false);
		assert.equal(result.timeout, true);
		assert.equal(result.error.code, 'SEARCH_CATALOG_WARM_TIMEOUT');
		assert.equal(HangingWorker.last.terminated, 1);
	} finally {
		clearTimeout(keepAlive);
	}
});
