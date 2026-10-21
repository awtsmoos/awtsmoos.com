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
 */
function mergePendingHits(baseHits = [], pendingHits = [], limit = 10) {
	const wanted = Number(limit) > 0 ? Math.floor(Number(limit)) : 10;
	const combined = [...(baseHits || []), ...(pendingHits || [])]
		.filter(Boolean)
		.sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
		.slice(0, wanted);
	return combined.map((hit, index) => ({ ...hit, rank: index + 1 }));
}

/** Observability for operators: size, persistence, queue depth. */
async function pendingIndexStats({ $i } = {}) {
	const store = getStore($i);
	loadStore(store);
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
	loadStore(store);
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
