//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module pendingCommentVectorsStore
 * @description
 * Per-process pending vector store registry, JSONL load and persistence.
 */

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

const { storePathFor, maxRows } = require('./pendingCommentVectorsCore.js');

/** Per-process store registry keyed by store file path ('' = memory-only). */
const stores = new Map();

function getStore($i) {
	const file = storePathFor($i);
	const key = file || '';
	let store = stores.get(key);
	if (!store) {
		store = {
			file,
			records: new Map(),
			order: [],
			loaded: false,
			loading: null,
			persisted: Boolean(file),
			queue: [],
			queuedKeys: new Set(),
			draining: null
		};
		stores.set(key, store);
	}
	return store;
}

/** Inserts one persisted row with first-occurrence-wins dedupe, as the load has always done. */
function insertLoadedRecord(store, record) {
	if (!record || !record.key || !Array.isArray(record.vector)) return;
	if (store.records.has(record.key)) return;
	store.records.set(record.key, {
		...record,
		vector: Float32Array.from(record.vector)
	});
	store.order.push(record.key);
}

/**
 * Loads persisted JSONL rows into memory, once per process, by STREAMING the
 * file line by line in the background. The previous implementation read the
 * whole file with readFileSync and parsed every record before applying the
 * row cap: with a 1.6 GB store file that was a multi-GB transient inside the
 * first visitor search after every restart (kernel OOM / V8 heap abort on
 * the production box). Streaming keeps the transient at one line plus the
 * capped record set, and FIFO eviction runs DURING the parse in batches, so
 * the final Map and order are exactly what the old load-then-cap produced:
 * the newest maxRows() first-occurrence records, in first-occurrence order.
 * The returned promise resolves when the parse completes; search callers do
 * not await it (pending hits are a bonus merge and simply grow in as the
 * load lands), while import/drain callers await it to keep their dedupe and
 * clearing semantics exact.
 */
function loadStore(store) {
	if (store.loaded) return Promise.resolve(true);
	if (store.loading) return store.loading;
	if (!store.file) {
		store.loaded = true;
		return Promise.resolve(true);
	}
	const EVICT_BATCH = 4096;
	store.loading = new Promise(resolve => {
		let finished = false;
		const finish = ok => {
			if (finished) return;
			finished = true;
			enforceCap(store);
			store.loaded = true;
			store.loading = null;
			resolve(ok);
		};
		let input;
		try {
			input = fs.createReadStream(store.file, { encoding: 'utf8' });
		} catch {
			finish(false);
			return;
		}
		input.on('error', () => finish(false));
		const lines = readline.createInterface({ input, crlfDelay: Infinity });
		// The interface re-emits input failures as its own 'error' event;
		// an unlistened 'error' would throw instead of ending the load.
		lines.on('error', () => finish(false));
		lines.on('line', line => {
			const trimmed = line.trim();
			if (!trimmed) return;
			try {
				insertLoadedRecord(store, JSON.parse(trimmed));
			} catch {}
			if (store.order.length > maxRows() + EVICT_BATCH) enforceCap(store);
		});
		lines.on('close', () => finish(true));
	});
	return store.loading;
}

function persistRecord(store, record) {
	if (!store.file) return;
	try {
		fs.mkdirSync(path.dirname(store.file), { recursive: true });
		fs.appendFileSync(store.file, JSON.stringify({
			key: record.key,
			commentId: record.commentId,
			aliasId: record.aliasId,
			seriesId: record.seriesId,
			postId: record.postId,
			verseSection: record.verseSection,
			subSection: record.subSection,
			vector: Array.from(record.vector, value => Number(value.toFixed(5))),
			indexedAt: record.indexedAt
		}) + '\n');
	} catch (error) {
		store.persisted = false;
		store.persistError = error.code || error.message;
	}
}

/** FIFO-evicts oldest rows when the store exceeds its cap. */
function enforceCap(store) {
	const cap = maxRows();
	const excess = store.order.length - cap;
	if (excess <= 0) return;
	const evicted = store.order.splice(0, excess);
	for (const key of evicted) store.records.delete(key);
}

function addRecord(store, record) {
	if (store.records.has(record.key)) return false;
	store.records.set(record.key, record);
	store.order.push(record.key);
	enforceCap(store);
	persistRecord(store, record);
	return true;
}

module.exports = {
	stores,
	getStore,
	loadStore,
	persistRecord,
	enforceCap,
	addRecord
};
