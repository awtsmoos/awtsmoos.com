// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file native-indexes.mjs
 * @module NativeRagIndexes
 * @description
 * The Awtsmoos builds immutable vector and lexical indexes with bounded dirty
 * graph memory. HNSW node mutations commit in small chunks while the build-only
 * key ledger stays open until final sealing, avoiding per-row key-ledger rewrites.
 */

const DEFAULT_GRAPH_CHUNK = 128;

/** Normalizes a finite graph mutation chunk without allowing zero-sized batches. */
function graphChunkSize(value) {
	const number = Number(value);
	if (!Number.isFinite(number) || number <= 0) return DEFAULT_GRAPH_CHUNK;
	return Math.max(1, Math.floor(number));
}

/**
 * Enables native text and vector indexes before the first candidate row exists.
 * @returns {object} Build session controlling bounded HNSW registry commits.
 */
export function beginNativeIndexes(database, list, dimensions, options = {}) {
	if (Number(list.length || 0) !== 0) {
		throw new Error('native_indexes_require_empty_list');
	}
	database.search.enable(list);
	database.search.appendOnlyBuild = true;
	database.vector.enable(list, {
		dimensions: Number(dimensions),
		metric: 'cosine',
		reindex: false
	});
	const status = database.vector.indexStatus(list);
	if (!status.index) throw new Error('native_vector_index_missing');
	status.index.keys.beginBulk({ replace: true });
	status.index.registry.beginBulk();
	return {
		index: status.index,
		path: status.path,
		chunkSize: graphChunkSize(options.graphChunkSize),
		rowsInChunk: 0,
		graphChunks: 0
	};
}

/**
 * Notes one inserted row and commits graph mutations whenever the chunk fills.
 * @returns {Promise<boolean>} True when a graph chunk was durably sealed.
 */
export async function noteNativeIndexRow(database, state) {
	state.rowsInChunk += 1;
	if (state.rowsInChunk < state.chunkSize) return false;
	await commitGraphChunk(database, state, true);
	return true;
}

/** Commits only dirty HNSW nodes; the build-only key ledger stays open. */
async function commitGraphChunk(database, state, continueBuild) {
	if (!state.rowsInChunk && continueBuild) return;
	state.index.registry.commitBulk();
	database.vector.persistIndex(state.path, state.index);
	state.graphChunks += state.rowsInChunk ? 1 : 0;
	state.rowsInChunk = 0;
	await database.waitForIdle();
	if (continueBuild) state.index.registry.beginBulk();
}

/** Flushes final graph state, one packed key ledger, and bounded text postings. */
export async function finishNativeIndexes(database, state) {
	await commitGraphChunk(database, state, false);
	state.index.keys.commitBulk();
	database.vector.persistIndex(state.path, state.index);
	database.search.appendOnlyBuild = false;
	database.search.flush();
	await database.waitForIdle();
	return {
		graphChunks: state.graphChunks,
		graphChunkSize: state.chunkSize
	};
}

/** Abandons an unpublished candidate without preserving partial build caches. */
export function releaseNativeIndexMode(database, state) {
	if (database?.search) database.search.appendOnlyBuild = false;
	try { state?.index?.registry?.abortBulk?.(); } catch (_error) {}
	try { state?.index?.keys?.abortBulk?.(); } catch (_error) {}
}

export {
	DEFAULT_GRAPH_CHUNK,
	graphChunkSize
};
