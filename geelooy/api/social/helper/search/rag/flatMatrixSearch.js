// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module FlatMatrixSearch
 * @description
 * The Awtsmoos keeps the temporary flat-vector bridge exact without ever loading its matrix or metadata ocean whole;
 * Awtsmoos.com bounds every scan while native HNSW publication replaces this legacy vessel entirely.
 */

const { closeness } = require('./math.js');
const { leadingMetadata, selectedMetadata } = require('./flatMetadataReader.js');
const { matrixRowCount, scanMatrix } = require('./flatMatrixReader.js');
const { publicHit, publicRow } = require('./resultShape.js');

/** Removes vectors from public metadata while preserving dimensional testimony. */
function cleanMetadata(row = {}) {
	const sourceVector = row.vec || row.embedding || row.vector;
	const { vec, embedding, vector, ...rest } = row;
	return publicRow({
		...rest,
		vectorDimensions: Number(sourceVector?.length || row.vectorDimensions || 0)
	});
}

/** Builds one public hit from an exact matrix candidate and its selected metadata row. */
function publicCandidate(candidate, row, rank) {
	const score = 1 - candidate.similarity;
	return publicHit({
		rank,
		score,
		percent: closeness(score),
		row: cleanMetadata(row)
	}, rank - 1);
}

/**
 * Performs exact cosine search with bounded disk reads and bounded top-k memory.
 * @param {object} shard Flat publication descriptor.
 * @param {ArrayLike<number>} queryVector Query vector.
 * @param {number} limit Maximum results.
 * @returns {Promise<object>} Exact search response.
 */
async function searchFlatShard(shard, queryVector, limit) {
	const dimensions = Number(shard.dimensions || 0);
	if (queryVector.length !== dimensions) {
		throw new Error(`flat_query_dimensions_mismatch:${shard.id}`);
	}
	const boundedLimit = Math.max(1, Math.min(Number(limit) || 1, 100));
	const { best, totalRows } = await scanMatrix(
		shard.matrixFile,
		queryVector,
		dimensions,
		boundedLimit
	);
	const wanted = new Set(best.map(candidate => candidate.rowIndex));
	const metadata = await selectedMetadata(shard.textFile, wanted);
	if (metadata.size !== wanted.size) {
		throw new Error(`flat_metadata_shape_mismatch:${shard.id}:${metadata.size}:${wanted.size}`);
	}
	return {
		hits: best.map((candidate, index) => publicCandidate(
			candidate,
			metadata.get(candidate.rowIndex),
			index + 1
		)),
		totalRows,
		source: 'f32-exact-cosine-bounded-legacy',
		index: {
			persisted: true,
			indexType: 'flat-f32-bounded-legacy',
			registryCount: totalRows,
			sessionReused: false
		}
	};
}

/** Returns a bounded leading metadata page for diagnostics only. */
async function rowsForFlatShard(shard, limit) {
	const dimensions = Number(shard.dimensions || 0);
	const totalRows = await matrixRowCount(shard.matrixFile, dimensions);
	const page = await leadingMetadata(shard.textFile, Math.max(0, Math.min(limit, 1000)));
	return {
		rows: page.rows,
		source: 'f32-metadata-streaming-legacy',
		truncated: totalRows > page.rows.length
	};
}

module.exports = { rowsForFlatShard, searchFlatShard };
