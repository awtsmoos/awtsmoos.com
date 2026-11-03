//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module IndexedWorkerPool
 * @description
 * The Awtsmoos divides persisted HNSW graph walks into four bounded vessels of light;
 * Awtsmoos.com keeps searching ahead of warming, with its HTTP heartbeat bright.
 */

const path = require('node:path');
const { Worker } = require('node:worker_threads');

const WORKER_COUNT = 4;
const MAX_PENDING = 128;
const workers = [];
const searches = [];
const warmups = [];
let sequence = 0;
let unavailable = false;

function workerError(message) {
	return Object.assign(new Error(message), { code: 'INDEX_WORKER_UNAVAILABLE' });
}

/** Assigns interactive searches before background warmups. */
function dispatch() {
	for (const runner of workers) {
		if (runner.current || runner.closed) continue;
		const job = searches.shift() || warmups.shift();
		if (!job) break;
		runner.current = job;
		runner.worker.ref();
		try {
			runner.worker.postMessage(job.task);
		} catch (error) {
			complete(runner, { id: job.task.id, error: { message: error.message } });
		}
	}
}

function complete(runner, reply) {
	const job = runner.current;
	if (!job || job.task.id !== reply.id) return;
	runner.current = null;
	runner.worker.unref();
	if (reply.error) {
		job.reject(Object.assign(new Error(reply.error.message), {
			code: reply.error.code || 'INDEX_WORKER_UNAVAILABLE'
		}));
	} else {
		job.resolve(reply.result);
	}
	dispatch();
}

function retire(runner, error) {
	if (runner.closed) return;
	runner.closed = true;
	if (runner.current) {
		runner.current.reject(workerError(error.message || 'Index worker stopped.'));
		runner.current = null;
	}
	const index = workers.indexOf(runner);
	if (index >= 0) workers.splice(index, 1);
	if (workers.length) {
		dispatch();
		return;
	}
	unavailable = true;
	for (const job of [...searches.splice(0), ...warmups.splice(0)]) {
		job.reject(workerError('No index workers remain.'));
	}
}

/** Starts a fixed number of reusable workers, not a thread for every query. */
function ensureWorkers() {
	if (unavailable) throw workerError('Indexed workers are unavailable.');
	if (workers.length) return;
	for (let index = 0; index < WORKER_COUNT; index += 1) {
		const worker = new Worker(path.join(__dirname, 'indexedPartWorker.js'));
		const runner = { worker, closed: false, current: null };
		worker.on('message', reply => complete(runner, reply));
		worker.on('error', error => retire(runner, error));
		worker.on('exit', code => retire(runner, new Error(`Worker exited: ${code}`)));
		worker.unref();
		workers.push(runner);
	}
}

function enqueue(type, part, vector, limit) {
	try {
		ensureWorkers();
	} catch (error) {
		return Promise.reject(error);
	}
	if (searches.length + warmups.length >= MAX_PENDING) {
		return Promise.reject(workerError('Index work queue is full.'));
	}
	return new Promise((resolve, reject) => {
		const job = { task: { id: ++sequence, type, part, vector, limit }, resolve, reject };
		(type === 'warm' ? warmups : searches).push(job);
		dispatch();
	});
}

/** Searches one physical index outside the HTTP event loop. */
function runIndexedPart(part, vector, limit) {
	return enqueue('search', part, vector, limit);
}

/** Warms the exact workers that later execute the user's indexed queries. */
function warmIndexedPart(part) {
	return enqueue('warm', part, null, 0);
}

module.exports = { runIndexedPart, warmIndexedPart };
