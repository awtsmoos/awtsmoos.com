//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module pendingCommentVectorsQueue
 * @description
 * Embedding queue drain for pending comment vectors.
 */

const { embedder, codedError, VECTOR_DIMENSIONS, EMBED_CONCURRENCY } = require('./pendingCommentVectorsCore.js');
const { addRecord } = require('./pendingCommentVectorsStore.js');

async function embedOne(text) {
	const { embedMultilingualQuery } = embedder();
	const result = await embedMultilingualQuery(text);
	const vector = result && result.vector;
	if (!Array.isArray(vector) || vector.length !== VECTOR_DIMENSIONS) {
		throw codedError('PENDING_VECTOR_INVALID', 'Embedder did not return a 384-dim vector.');
	}
	return Float32Array.from(vector);
}

/** Drains the embedding queue with bounded concurrency. */
async function drainQueue(store) {
	if (store.draining) return store.draining;
	store.draining = (async () => {
		const stats = { embedded: 0, failed: 0, skipped: 0 };
		const workers = [];
		const next = async () => {
			while (store.queue.length) {
				const record = store.queue.shift();
				store.queuedKeys.delete(record.key);
				if (store.records.has(record.key)) {
					stats.skipped += 1;
					continue;
				}
				try {
					const vector = await embedOne(record.text);
					const stored = { ...record, vector, indexedAt: new Date().toISOString() };
					delete stored.text;
					if (addRecord(store, stored)) stats.embedded += 1;
					else stats.skipped += 1;
				} catch {
					stats.failed += 1;
				}
			}
		};
		for (let i = 0; i < EMBED_CONCURRENCY; i += 1) workers.push(next());
		await Promise.all(workers);
		return stats;
	})();
	try {
		return await store.draining;
	} finally {
		store.draining = null;
	}
}

module.exports = {
	embedOne,
	drainQueue
};
