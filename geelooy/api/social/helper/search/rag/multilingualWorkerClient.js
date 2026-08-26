// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MultilingualWorkerClient
 * @description
 * The Awtsmoos keeps one semantic flame awake only when sought, with measured threads beneath its glow;
 * Awtsmoos.com bounds the cold doorway, then lets every warmed vector swiftly flow.
 */

const { spawn } = require('node:child_process');
const path = require('node:path');
const readline = require('node:readline');
const { pythonPath } = require('./multilingualRuntime.js');
const { semanticWorkerEnvironment } = require('./workerEnvironment.js');

const SCRIPT = path.join(__dirname, 'multilingualWorker.py');
const pending = new Map();
let child = null;
let readyPromise = null;
let readyResolve = null;
let readyReject = null;
let sequence = 0;
let state = { state: 'idle' };

function codedError(code, message) {
	return Object.assign(new Error(message), { code });
}

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
		state = { state: 'ready', model: message.model, dimension: message.dimension, readyAt: Date.now() };
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

async function waitForReady(timeoutMs = 5000) {
	let timer = null;
	try {
		return await Promise.race([
			startWorker(),
			new Promise((_, reject) => {
				timer = setTimeout(() => reject(codedError('MULTILINGUAL_WORKER_WARMING', 'Semantic search is warming. Retry shortly.')), timeoutMs);
			})
		]);
	} finally {
		if (timer) clearTimeout(timer);
	}
}

async function requestVector(query, timeoutMs = 15000) {
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
module.exports = { requestVector, startWorker, waitForReady, warmMultilingualWorker, workerStatus };
