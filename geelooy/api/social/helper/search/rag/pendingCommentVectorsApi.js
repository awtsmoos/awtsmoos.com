//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module pendingCommentVectorsApi
 * @description
 * Import noting and pending vector search for freshly imported comments.
 */

const { cosine, closeness } = require('./math.js');
const crypto = require('node:crypto');

const { getStore, loadStore } = require('./pendingCommentVectorsStore.js');
const { normalizeRow } = require('./pendingCommentVectorsRows.js');
const { drainQueue } = require('./pendingCommentVectorsQueue.js');
const { codedError } = require('./pendingCommentVectorsCore.js');

/**
 * The pending result for one query vector never depends on which lane asks
 * for it, yet vectorSource invokes the pending search once per lane — the
 * same up-to-100k-record cosine scan repeated up to seven times per visitor
 * query on the main thread. Identical asks inside a short window share one
 * computation. Only fully-loaded stores are memoized: a result computed
 * from a still-streaming store is partial by definition and is recomputed
 * on the next ask instead of being remembered as complete.
 */
const PENDING_MEMO_TTL_MS = 10000;
const PENDING_MEMO_MAX_ENTRIES = 16;
const pendingMemo = new Map();

function pendingMemoKey(queryVector, limit, aliasSet) {
	const bytes = ArrayBuffer.isView(queryVector)
		? Buffer.from(queryVector.buffer, queryVector.byteOffset, queryVector.byteLength)
		: Buffer.from(Float32Array.from(queryVector).buffer);
	const hash = crypto.createHash('sha256').update(bytes).digest('hex');
	const aliases = aliasSet ? [...aliasSet].map(String).sort().join(',') : '';
	return `${hash}|${limit}|${aliases}`;
}

function clonePendingHits(hits) {
	return hits.map(hit => ({ ...hit, row: { ...hit.row } }));
}

function readPendingMemo(key) {
	const entry = pendingMemo.get(key);
	if (!entry) return null;
	if (Date.now() - entry.createdAt > PENDING_MEMO_TTL_MS) {
		pendingMemo.delete(key);
		return null;
	}
	pendingMemo.delete(key);
	pendingMemo.set(key, entry);
	return clonePendingHits(entry.hits);
}

function rememberPendingMemo(key, hits) {
	pendingMemo.delete(key);
	pendingMemo.set(key, { createdAt: Date.now(), hits: clonePendingHits(hits) });
	while (pendingMemo.size > PENDING_MEMO_MAX_ENTRIES) {
		pendingMemo.delete(pendingMemo.keys().next().value);
	}
}

/**
 * Indexes freshly imported comment rows for prompt semantic search.
 * Safe to call without awaiting — the queue drains in the background and
 * per-row failures never reject the batch. Idempotent by record key.
 */
async function noteImportedComments({ $i, rows = [], aliasId = '' } = {}) {
	const store = getStore($i);
	// Imports dedupe against the persisted set, so they wait for the
	// streaming load to finish; searches (below) never wait on it.
	await loadStore(store);
	const list = Array.isArray(rows) ? rows : [rows];
	let queued = 0;
	let skipped = 0;
	for (const raw of list) {
		const record = normalizeRow(raw, aliasId);
		if (!record) {
			skipped += 1;
			continue;
		}
		if (store.records.has(record.key) || store.queuedKeys.has(record.key)) {
			skipped += 1;
			continue;
		}
		store.queue.push(record);
		store.queuedKeys.add(record.key);
		queued += 1;
	}
	const drained = await drainQueue(store);
	return { queued, skipped: skipped + drained.skipped, embedded: drained.embedded, failed: drained.failed };
}

/**
 * Searches pending vectors for one query vector. Returns hits shaped like
 * shard hits ({ rank, score, percent, row }) with live comment coordinates
 * for the existing hydration path.
 */
async function searchPendingVectors({ $i, queryVector, limit = 10, aliasIds = null } = {}) {
	const store = getStore($i);
	// Starts (or continues) the background streaming load; the scan below
	// uses whatever records have landed so far and never blocks a visitor
	// search on the store file again.
	loadStore(store);
	if (!Array.isArray(queryVector) || !queryVector.length) {
		throw codedError('PENDING_VECTOR_QUERY_MISSING', 'A query vector is required.');
	}
	const wanted = Number(limit) > 0 ? Math.floor(Number(limit)) : 10;
	const aliasSet = Array.isArray(aliasIds) && aliasIds.length
		? new Set(aliasIds.map(String))
		: null;
	const memoKey = pendingMemoKey(queryVector, wanted, aliasSet);
	if (store.loaded) {
		const remembered = readPendingMemo(memoKey);
		if (remembered) return remembered;
	}
	const scored = [];
	for (const record of store.records.values()) {
		if (aliasSet && record.aliasId && !aliasSet.has(record.aliasId)) continue;
		const score = cosine(queryVector, record.vector);
		if (!Number.isFinite(score)) continue;
		scored.push({ record, score });
	}
	scored.sort((a, b) => b.score - a.score);
	const hits = scored.slice(0, wanted).map((item, index) => ({
		rank: index + 1,
		score: Number(item.score.toFixed(6)),
		percent: closeness(item.score),
		row: {
			commentId: item.record.commentId,
			aliasId: item.record.aliasId,
			seriesId: item.record.seriesId,
			postId: item.record.postId,
			verseSection: item.record.verseSection,
			subSection: item.record.subSection,
			pendingVector: true,
			vectorSource: 'pending-comment-vectors',
			indexedAt: item.record.indexedAt
		}
	}));
	if (store.loaded) rememberPendingMemo(memoKey, hits);
	return hits;
}

module.exports = {
	noteImportedComments,
	searchPendingVectors
};
