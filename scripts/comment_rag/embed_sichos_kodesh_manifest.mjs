#!/usr/bin/env node
// B"H
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import {
	DIMENSIONS,
	FAILURES,
	JOB_ROOT,
	LLAMA,
	MANIFEST,
	MODEL,
	PROGRESS,
	VECTORS
} from './sichos_kodesh/config.mjs';

if (!process.argv.includes('--run')) {
	throw new Error('Embedding is locked. Re-run with --run only after manifest review.');
}

const workerCount = Number(process.env.SICHOS_KODESH_EMBED_WORKERS || 2);
const retryCount = Number(process.env.SICHOS_KODESH_EMBED_RETRIES || 5);
const workerId = Number(process.env.SICHOS_KODESH_WORKER_ID ?? -1);
const workerDirectory = path.join(JOB_ROOT, 'worker-results');

if (!Number.isInteger(workerCount) || workerCount < 1) {
	throw new Error(`Invalid worker count: ${workerCount}`);
}

function readManifest() {
	return fs.readFileSync(MANIFEST, 'utf8')
		.split(/\n/)
		.filter(Boolean)
		.map((line, manifestIndex) => ({ manifestIndex, ...JSON.parse(line) }));
}

function extractNumbers(raw = '') {
	return String(raw)
		.match(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g)
		?.map(Number)
		.filter(Number.isFinite) || [];
}

function normalizeVector(vector) {
	const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
	return vector.map(value => Number((value / magnitude).toFixed(7)));
}

function parseVector(stdout) {
	const numbers = extractNumbers(stdout);
	if (numbers.length !== DIMENSIONS) {
		throw new Error(`Expected ${DIMENSIONS} dimensions, received ${numbers.length}`);
	}
	return normalizeVector(numbers);
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function runLlama(text) {
	return new Promise((resolve, reject) => {
		const process = spawn(LLAMA, [
			'-m', MODEL,
			'-p', text,
			'--pooling', 'cls',
			'--embd-normalize', '2',
			'--embd-output-format', 'raw',
			'-t', '1'
		], { stdio: ['ignore', 'pipe', 'pipe'] });
		let stdout = '';
		let stderr = '';
		process.stdout.setEncoding('utf8');
		process.stderr.setEncoding('utf8');
		process.stdout.on('data', chunk => { stdout += chunk; });
		process.stderr.on('data', chunk => { stderr += chunk; });
		process.once('error', reject);
		process.once('close', code => {
			if (code !== 0) {
				reject(new Error(stderr || `llama exited ${code}`));
				return;
			}
			try {
				resolve(parseVector(stdout));
			} catch (error) {
				reject(error);
			}
		});
	});
}

async function embedText(text) {
	let lastError;
	for (let attempt = 1; attempt <= retryCount; attempt += 1) {
		try {
			return await runLlama(text);
		} catch (error) {
			lastError = error;
			await sleep(250 * attempt);
		}
	}
	throw lastError;
}

function readJsonLines(file) {
	if (!fs.existsSync(file)) return [];
	return fs.readFileSync(file, 'utf8')
		.split(/\n/)
		.filter(Boolean)
		.map(line => JSON.parse(line));
}

function workerFile(id) {
	return path.join(workerDirectory, `worker-${id}.jsonl`);
}

function countCompleted() {
	let total = 0;
	if (!fs.existsSync(workerDirectory)) return total;
	for (const name of fs.readdirSync(workerDirectory).filter(name => /^worker-\d+\.jsonl$/.test(name))) {
		total += readJsonLines(path.join(workerDirectory, name)).length;
	}
	return total;
}

function writeProgress(extra = {}) {
	const payload = {
		BH: 'B"H',
		total: readManifest().length,
		completed: countCompleted(),
		workers: workerCount,
		partition: 'manifestIndex modulo workerCount',
		resumable: true,
		workerDirectory,
		...extra,
		updatedAt: new Date().toISOString()
	};
	const temporary = `${PROGRESS}.tmp-${process.pid}`;
	fs.writeFileSync(temporary, JSON.stringify(payload, null, 2));
	fs.renameSync(temporary, PROGRESS);
}

function makeVectorRecord(item, vector, id) {
	return {
		...item,
		workerId: id,
		partitionRule: `manifestIndex % ${workerCount} === ${id}`,
		provider: 'llama-embedding:bge-small-en-v1.5-q8_0',
		realEmbedding: true,
		dimensions: vector.length,
		vec: vector
	};
}

async function runWorker() {
	fs.mkdirSync(workerDirectory, { recursive: true });
	const assigned = readManifest().filter(item => item.manifestIndex % workerCount === workerId);
	const output = workerFile(workerId);
	const completed = new Set(readJsonLines(output).map(row => row.id));
	let workerDone = completed.size;
	for (const item of assigned) {
		if (completed.has(item.id)) continue;
		try {
			const vector = await embedText(item.text);
			fs.appendFileSync(output, `${JSON.stringify(makeVectorRecord(item, vector, workerId))}\n`);
			completed.add(item.id);
			workerDone += 1;
			if (workerDone % 5 === 0) {
				writeProgress({ workerId, workerDone, workerTotal: assigned.length, currentId: item.id });
			}
		} catch (error) {
			fs.appendFileSync(FAILURES, `${JSON.stringify({
				id: item.id,
				workerId,
				manifestIndex: item.manifestIndex,
				error: error.stack || String(error),
				at: new Date().toISOString()
			})}\n`);
			writeProgress({ workerId, workerDone, workerTotal: assigned.length, failedId: item.id });
			throw error;
		}
	}
	writeProgress({ workerId, workerDone, workerTotal: assigned.length, workerComplete: true });
}

function migrateLegacyVectors() {
	if (!fs.existsSync(VECTORS)) return;
	fs.mkdirSync(workerDirectory, { recursive: true });
	const existingByWorker = new Map();
	for (let id = 0; id < workerCount; id += 1) {
		existingByWorker.set(id, new Set(readJsonLines(workerFile(id)).map(row => row.id)));
	}
	for (const row of readJsonLines(VECTORS)) {
		const id = Number(row.workerId ?? row.manifestIndex % workerCount);
		if (!Number.isInteger(id) || id < 0 || id >= workerCount) continue;
		if (existingByWorker.get(id).has(row.id)) continue;
		fs.appendFileSync(workerFile(id), `${JSON.stringify(row)}\n`);
		existingByWorker.get(id).add(row.id);
	}
}

function mergeWorkerFiles() {
	const byId = new Map();
	for (let id = 0; id < workerCount; id += 1) {
		for (const row of readJsonLines(workerFile(id))) byId.set(row.id, row);
	}
	const ordered = readManifest().filter(item => byId.has(item.id)).map(item => byId.get(item.id));
	const temporary = `${VECTORS}.tmp-${process.pid}`;
	fs.writeFileSync(temporary, ordered.map(JSON.stringify).join('\n') + (ordered.length ? '\n' : ''));
	fs.renameSync(temporary, VECTORS);
	return ordered.length;
}

async function runParent() {
	fs.mkdirSync(JOB_ROOT, { recursive: true });
	migrateLegacyVectors();
	writeProgress({ phase: 'starting-resumable-workers' });
	const children = [];
	for (let id = 0; id < workerCount; id += 1) {
		children.push(spawn(process.execPath, [new URL(import.meta.url).pathname, '--run'], {
			cwd: process.cwd(),
			stdio: ['ignore', 'inherit', 'inherit'],
			env: {
				...process.env,
				SICHOS_KODESH_WORKER_ID: String(id),
				SICHOS_KODESH_EMBED_WORKERS: String(workerCount),
				SICHOS_KODESH_EMBED_RETRIES: String(retryCount)
			}
		}));
	}
	await new Promise((resolve, reject) => {
		let remaining = children.length;
		let settled = false;
		for (const child of children) {
			child.once('exit', code => {
				if (settled) return;
				if (code !== 0) {
					settled = true;
					reject(new Error(`Embedding worker ${child.pid} exited ${code}`));
					return;
				}
				remaining -= 1;
				if (!remaining) {
					settled = true;
					resolve();
				}
			});
		}
	});
	const completed = mergeWorkerFiles();
	writeProgress({ phase: 'completed', completed });
	console.log(JSON.stringify({
		BH: 'B"H',
		total: readManifest().length,
		completed,
		workers: workerCount,
		resumable: true,
		vectors: VECTORS
	}, null, 2));
}

if (workerId >= 0) {
	runWorker().catch(error => {
		console.error(error.stack || error);
		process.exit(1);
	});
} else {
	runParent().catch(error => {
		console.error(error.stack || error);
		process.exit(1);
	});
}
