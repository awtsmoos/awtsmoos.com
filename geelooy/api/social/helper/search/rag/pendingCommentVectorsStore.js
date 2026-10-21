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
			persisted: Boolean(file),
			queue: [],
			queuedKeys: new Set(),
			draining: null
		};
		stores.set(key, store);
	}
	return store;
}

/** Loads persisted JSONL rows into memory (once per process). */
function loadStore(store) {
	if (store.loaded) return;
	store.loaded = true;
	if (!store.file) return;
	let content = '';
	try {
		content = fs.readFileSync(store.file, 'utf8');
	} catch {
		return;
	}
	for (const line of content.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed) continue;
		try {
			const record = JSON.parse(trimmed);
			if (!record || !record.key || !Array.isArray(record.vector)) continue;
			if (store.records.has(record.key)) continue;
			store.records.set(record.key, {
				...record,
				vector: Float32Array.from(record.vector)
			});
			store.order.push(record.key);
		} catch {}
	}
	enforceCap(store);
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
	while (store.order.length > cap) {
		const oldest = store.order.shift();
		store.records.delete(oldest);
	}
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
