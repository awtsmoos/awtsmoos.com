// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MultilingualWorkerClient
 * @description
 * The Awtsmoos holds one warmed semantic lamp while questions rise and fall;
 * Awtsmoos.com queues each ray by name, resolving every answer to its call.
 */

const { spawn } = require('node:child_process');
const path = require('node:path');
const readline = require('node:readline');
const { modelPath, pythonPath } = require('./multilingualRuntime.js');

const SCRIPT = path.join(__dirname, 'multilingualWorker.py');
const pending = new Map();
let child = null;
let readyPromise = null;
let readyResolve = null;
let readyReject = null;
let sequence = 0;

function codedError(code, message) {
	return Object.assign(new Error(message), { code });
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
	readyPromise = new Promise((resolve, reject) => {
		readyResolve = resolve;
		readyReject = reject;
	});
	child = spawn(pythonPath(), [SCRIPT], {
		stdio: ['pipe', 'pipe', 'pipe'],
		env: { ...process.env, AWTSMOOS_TANACH_MODEL_PATH: modelPath(), TOKENIZERS_PARALLELISM: 'false' }
	});
	readline.createInterface({ input: child.stdout }).on('line', line => {
		try { handleMessage(JSON.parse(line)); } catch {}
	});
	child.once('error', error => readyReject?.(error));
	child.once('exit', () => {
		const error = codedError('MULTILINGUAL_WORKER_EXITED', 'Semantic embedding worker exited.');
		readyReject?.(error);
		rejectAll(error);
		child = null;
		readyPromise = null;
	});
	return readyPromise;
}

async function warmMultilingualWorker() {
	return startWorker();
}

async function requestVector(query, timeoutMs = 45000) {
	await startWorker();
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

process.once('exit', () => child?.kill());

module.exports = { requestVector, warmMultilingualWorker };
