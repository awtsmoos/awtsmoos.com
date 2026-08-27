// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactHebrewWorker
 * @description
 * The canonical v3 gzip shard is inflated only in this worker thread. One
 * corpus is cached at a time, preventing multi-corpus memory accumulation while
 * repeated queries remain warm and HTTP stays free and responsive.
 */

const { parentPort, workerData } = require('worker_threads');
const { performance } = require('perf_hooks');
const {
	ROOTS,
	corpusList
} = require('./exactHebrewShape.js');
const {
	loadShard,
	searchShard
} = require('./exactHebrewV3.js');
const {
	buildResponse
} = require('./exactHebrewResponse.js');
const {
	serializable
} = require('./exactHebrewSerializable.js');
const {
	closeDatabase,
	openDatabase
} = require('./exactHebrewWorkerDb.js');

const opened = openDatabase(workerData.dbPath);
const shardCache = new Map();

function cachedShard(corpus) {
	if (!ROOTS[corpus]) {
		const error = new Error(`Unknown exact corpus: ${corpus}`);
		error.code = 'UNKNOWN_EXACT_CORPUS';
		throw error;
	}
	if (!shardCache.has(corpus)) {
		shardCache.clear();
		shardCache.set(corpus, loadShard(opened.database, corpus));
	}
	return shardCache.get(corpus);
}

function execute(request) {
	let loadMs = 0;
	let queryMs = 0;
	const results = [];
	for (const corpus of corpusList(request.corpus)) {
		const loadStartedAt = performance.now();
		const shard = cachedShard(corpus);
		loadMs += performance.now() - loadStartedAt;
		const queryStartedAt = performance.now();
		results.push(searchShard(shard, corpus, request));
		queryMs += performance.now() - queryStartedAt;
	}
	return {
		result: serializable(buildResponse(request, results)),
		loadMs: Number(loadMs.toFixed(3)),
		queryMs: Number(queryMs.toFixed(3)),
		cachedCorpora: [...shardCache.keys()]
	};
}

function errorShape(error) {
	return {
		code: error.code || 'EXACT_SEARCH_FAILED',
		message: error.message,
		stack: error.stack
	};
}

function reply(message) {
	try {
		parentPort.postMessage({
			id: message.id,
			ok: true,
			...execute(message.request)
		});
	} catch (error) {
		parentPort.postMessage({
			id: message.id,
			ok: false,
			error: errorShape(error)
		});
	}
}

parentPort.postMessage({ type: 'ready', openMs: opened.openMs });
parentPort.on('message', reply);
process.on('exit', () => closeDatabase(opened.database));
