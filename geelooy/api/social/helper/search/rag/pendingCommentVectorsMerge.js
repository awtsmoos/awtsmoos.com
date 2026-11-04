//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module pendingCommentVectorsMerge
 * @description
 * Pending hit merging, stats and drain-after-publication for pending comment vectors.
 */

const fs = require('node:fs');

const { getStore, loadStore } = require('./pendingCommentVectorsStore.js');
const { maxRows, VECTOR_DIMENSIONS } = require('./pendingCommentVectorsCore.js');

/**
 * Merges pending hits with immutable shard hits, sorted by score.
 * Pending hits keep their coordinates; provenance stays visible via
 * row.pendingVector / row.vectorSource.
 *
 * SEARCH ITERATION 8 (2026-11-04): the merged window now applies the same
 * per-source diversity rule the library merge adopted in iteration 7
 * (at most PENDING_SOURCE_CAP hits per postId in the first pass, relaxed
 * only to fill the requested window). Pending records are per-COMMENT, so
 * one post contributes many near-identical vectors; uncapped, a single
 * post filled an entire visitor top-5 ("Noah ark" → five hits from one
 * post, parent UI battery 2026-11-04). Hits without a postId share the
 * series/source fallback key, mirroring rankedMergeHits.
 */
const PENDING_SOURCE_CAP = 2;

function pendingSourceKey(hit) {
	const row = hit?.row || hit || {};
	return String(row.postId || row.seriesId || row.source || row.series || '');
}

function mergePendingHits(baseHits = [], pendingHits = [], limit = 10) {
	const wanted = Number(limit) > 0 ? Math.floor(Number(limit)) : 10;
	const combined = [...(baseHits || []), ...(pendingHits || [])]
		.filter(Boolean)
		.sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
	const counts = new Map();
	const firstPass = [];
	const overflow = [];
	for (const hit of combined) {
		const key = pendingSourceKey(hit);
		const seen = counts.get(key) || 0;
		if (key && seen >= PENDING_SOURCE_CAP) {
			overflow.push(hit);
			continue;
		}
		counts.set(key, seen + 1);
		firstPass.push(hit);
	}
	return [...firstPass, ...overflow]
		.slice(0, wanted)
		.map((hit, index) => ({ ...hit, rank: index + 1 }));
}

/** Observability for operators: size, persistence, queue depth. */
async function pendingIndexStats({ $i } = {}) {
	const store = getStore($i);
	await loadStore(store);
	return {
		records: store.records.size,
		queued: store.queue.length,
		draining: Boolean(store.draining),
		persisted: store.persisted,
		persistError: store.persistError || null,
		storeFile: store.file || null,
		maxRows: maxRows(),
		model: 'intfloat/multilingual-e5-small',
		dimensions: VECTOR_DIMENSIONS
	};
}

/**
 * Clears the pending store after a full RAG publication rebuild has absorbed
 * the rows. Returns the number of cleared records.
 */
async function drainPendingVectors({ $i } = {}) {
	const store = getStore($i);
	await loadStore(store);
	const cleared = store.records.size;
	store.records.clear();
	store.order.length = 0;
	if (store.file) {
		try {
			fs.writeFileSync(store.file, '');
		} catch {}
	}
	return { cleared };
}

module.exports = {
	mergePendingHits,
	pendingIndexStats,
	drainPendingVectors
};
