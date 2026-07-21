// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactHebrewWorkerClient
 * @description
 * One read-only worker opens the canonical exact index. HTTP stays responsive
 * while a cold corpus may be inflated once and warm bucket requests stay fast.
 */

const path = require('path');
const { Worker } = require('worker_threads');
const pending = require('./exactHebrewPending.js');

const DEFAULT_DB = '/Users/awtsmoos/Documents/awtsmoos-jobs/tanach-hebrew-word-index/exact-hebrew-indexes.awtsmoosdb';
const REQUEST_TIMEOUT_MS = 40_000;

let worker = null;
let readyPromise = null;
let state = {
	state: 'cold',
	dbPath: null,
	openMs: null,
	lastError: null
};

function dbPath() {
	return process.env.EXACT_HEBREW_INDEX_DB || DEFAULT_DB;
}

function status() {
	return {
		...state,
		pendingRequests: pending.size()
	};
}

function fail(error, rejectReady) {
	state = {
		...state,
		state: 'failed',
		lastError: error.message
	};
	rejectReady(error);
	pending.rejectAll(error);
}

function handleMessage(message, resolveReady, rejectReady) {
	if (message.type === 'ready') {
		state = {
			state: 'ready',
			dbPath: dbPath(),
			openMs: message.openMs,
			lastError: null
		};
		resolveReady(status());
		return;
	}
	if (message.type === 'startup-error') {
		fail(pending.workerError(message.error), rejectReady);
		return;
	}
	pending.resolveMessage(message, state.openMs);
}

function createWorker(resolveReady, rejectReady) {
	worker = new Worker(path.join(__dirname, 'exactHebrewWorker.js'), {
		workerData: { dbPath: dbPath() }
	});
	worker.unref();
	worker.on('message', message => {
		handleMessage(message, resolveReady, rejectReady);
	});
	worker.on('error', error => {
		fail(error, rejectReady);
	});
	worker.on('exit', code => {
		if (code !== 0) {
			pending.rejectAll(pending.workerError({
				message: `Worker exited ${code}`
			}));
		}
		worker = null;
		readyPromise = null;
		if (state.state !== 'failed') {
			state = { ...state, state: 'stopped' };
		}
	});
}

function start() {
	if (worker) return readyPromise;
	state = {
		state: 'starting',
		dbPath: dbPath(),
		openMs: null,
		lastError: null
	};
	readyPromise = new Promise((resolveReady, rejectReady) => {
		createWorker(resolveReady, rejectReady);
	});
	return readyPromise;
}

async function search(request) {
	await start();
	return pending.request(worker, request, REQUEST_TIMEOUT_MS);
}

module.exports = {
	dbPath,
	search,
	start,
	status
};
