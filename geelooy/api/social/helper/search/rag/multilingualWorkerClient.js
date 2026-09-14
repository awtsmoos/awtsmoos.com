// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MultilingualWorkerClient
 * @description
 * The Awtsmoos keeps one warmed semantic child beyond the HTTP event-loop wall;
 * cold callers share one awakening while finite deadline policy lives separately,
 * leaving lifecycle, message routing, and inference ownership explicit and small.
 */

const { spawn } = require('node:child_process');
const path = require('node:path');
const readline = require('node:readline');
const { pythonPath } = require('./multilingualRuntime.js');
const { semanticWorkerEnvironment } = require('./workerEnvironment.js');
const {
	QUERY_TIMEOUT_MS,
	READY_TIMEOUT_MS,
	codedError,
	waitForWorker
} = require('./multilingualWorkerDeadline.js');

const SCRIPT = path.join(__dirname, 'multilingualWorker.py');
const pending = new Map();
let child = null;
let readyPromise = null;
let readyResolve = null;
let readyReject = null;
let sequence = 0;
let state = { state: 'idle' };

function workerStatus() {
	return { ...state, pid: child?.pid || null };
}

function rejectAll(error) {
	for (const item of pending.values()) {
		clearTimeout(item.timer);
		item.reject(error);
	}
	pending.clear();
}

function handleMessage(message) {
	if (message.type === 'ready') {
		state = {
			state: 'ready',
			model: message.model,
			dimension: message.dimension,
			inferenceWarm: message.inferenceWarm === true,
			readyAt: Date.now()
		};
		readyResolve?.(message);
		return;
	}
	const item = pending.get(String(message.id));
	if (!item) return;
	pending.delete(String(message.id));
	clearTimeout(item.timer);
	if (message.error) item.reject(codedError('MULTILINGUAL_EMBEDDER_FAILED', message.error));
	else item.resolve(message.vector);
}

function startWorker() {
	if (child && !child.killed && readyPromise) return readyPromise;
	state = { state: 'warming', startedAt: Date.now() };
	readyPromise = new Promise((resolve, reject) => {
		readyResolve = resolve;
		readyReject = reject;
	});
	child = spawn(pythonPath(), [SCRIPT], {
		stdio: ['pipe', 'pipe', 'pipe'],
		env: semanticWorkerEnvironment()
	});
	readline.createInterface({ input: child.stdout }).on('line', line => {
		try { handleMessage(JSON.parse(line)); } catch {}
	});
	child.once('error', error => readyReject?.(error));
	child.once('exit', () => {
		const error = codedError('MULTILINGUAL_WORKER_EXITED', 'Semantic embedding worker exited.');
		state = { state: 'failed', failedAt: Date.now(), error: error.message };
		readyReject?.(error);
		rejectAll(error);
		child = null;
		readyPromise = null;
	});
	return readyPromise;
}

async function waitForReady(timeoutMs = READY_TIMEOUT_MS) {
	return waitForWorker(startWorker, timeoutMs);
}

async function requestVector(query, timeoutMs = QUERY_TIMEOUT_MS) {
	await waitForReady();
	const id = String(++sequence);
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			pending.delete(id);
			reject(codedError('MULTILINGUAL_QUERY_TIMEOUT', 'Semantic query embedding timed out.'));
		}, timeoutMs);
		pending.set(id, { resolve, reject, timer });
		child.stdin.write(`${JSON.stringify({ id, query })}\n`);
	});
}

const warmMultilingualWorker = startWorker;
process.once('exit', () => child?.kill());
module.exports = {
	requestVector,
	startWorker,
	waitForReady,
	warmMultilingualWorker,
	workerStatus
};
