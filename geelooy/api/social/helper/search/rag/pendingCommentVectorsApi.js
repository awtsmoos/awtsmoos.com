//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module pendingCommentVectorsApi
 * @description
 * Import noting and pending vector search for freshly imported comments.
 */

const { cosine, closeness } = require('./math.js');

const { getStore, loadStore } = require('./pendingCommentVectorsStore.js');
const { normalizeRow } = require('./pendingCommentVectorsRows.js');
const { drainQueue } = require('./pendingCommentVectorsQueue.js');
const { codedError } = require('./pendingCommentVectorsCore.js');

/**
 * Indexes freshly imported comment rows for prompt semantic search.
 * Safe to call without awaiting — the queue drains in the background and
 * per-row failures never reject the batch. Idempotent by record key.
 */
async function noteImportedComments({ $i, rows = [], aliasId = '' } = {}) {
	const store = getStore($i);
	loadStore(store);
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
	loadStore(store);
	if (!Array.isArray(queryVector) || !queryVector.length) {
		throw codedError('PENDING_VECTOR_QUERY_MISSING', 'A query vector is required.');
	}
	const wanted = Number(limit) > 0 ? Math.floor(Number(limit)) : 10;
	const aliasSet = Array.isArray(aliasIds) && aliasIds.length
		? new Set(aliasIds.map(String))
		: null;
	const scored = [];
	for (const record of store.records.values()) {
		if (aliasSet && record.aliasId && !aliasSet.has(record.aliasId)) continue;
		const score = cosine(queryVector, record.vector);
		if (!Number.isFinite(score)) continue;
		scored.push({ record, score });
	}
	scored.sort((a, b) => b.score - a.score);
	return scored.slice(0, wanted).map((item, index) => ({
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
}

module.exports = {
	noteImportedComments,
	searchPendingVectors
};
