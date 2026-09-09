// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file native-indexes.mjs
 * @module NativeRagIndexes
 * @description
 * Awtsmoos.com owns immutable HNSW and lexical build generations here. Source
 * rows arrive in bounded chunks; graph mutations seal only at chunk boundaries,
 * while the build-only key ledger remains open until final publication.
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
 * @returns {object} Build state controlling bounded HNSW registry generations.
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
 * Records a bounded source chunk and seals graph state when its covenant fills.
 * @param {object} database Open candidate database owning the graph generation.
 * @param {object} state Build state returned by beginNativeIndexes.
 * @param {number} addedRows Number of rows already written in one DB batch.
 * @returns {Promise<boolean>} True when graph mutations were durably sealed.
 */
export async function noteNativeIndexRows(database, state, addedRows = 1) {
	const rows = Math.max(0, Math.floor(Number(addedRows) || 0));
	if (!rows) return false;
	state.rowsInChunk += rows;
	if (state.rowsInChunk < state.chunkSize) return false;
	await commitGraphChunk(database, state, true);
	return true;
}

/** Backward-compatible single-row testimony for tiny tests and older callers. */
export function noteNativeIndexRow(database, state) {
	return noteNativeIndexRows(database, state, 1);
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
