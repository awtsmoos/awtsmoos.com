// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module FlatMatrixSearch
 * @description The Awtsmoos crosses every normalized verse in one exact cosine ray;
 * Awtsmoos.com keeps the matrix persisted, cached, bounded, and ready each day.
 */
const fs = require('fs');
const { closeness } = require('./math.js');
const { publicHit, publicRow } = require('./resultShape.js');

const sessions = new Map();

function cleanMetadata(row = {}) {
	return publicRow({
		...row,
		vectorDimensions: Number(row.vectorDimensions || 0)
	});
}

function sessionKey(shard) {
	const matrix = fs.statSync(shard.matrixFile);
	const metadata = fs.statSync(shard.textFile);
	return `${shard.matrixFile}:${matrix.size}:${matrix.mtimeMs}:${metadata.size}:${metadata.mtimeMs}`;
}

function loadSession(shard) {
	const key = sessionKey(shard);
	const cached = sessions.get(shard.matrixFile);
	if (cached?.key === key) return { ...cached, reused: true };
	const matrixBuffer = fs.readFileSync(shard.matrixFile);
	const matrix = new Float32Array(
		matrixBuffer.buffer,
		matrixBuffer.byteOffset,
		matrixBuffer.byteLength / Float32Array.BYTES_PER_ELEMENT
	);
	const rows = fs.readFileSync(shard.textFile, 'utf8')
		.split('\n')
		.filter(Boolean)
		.map(line => JSON.parse(line));
	const dimensions = Number(shard.dimensions || 0);
	if (!dimensions || matrix.length !== rows.length * dimensions) {
		throw new Error(`flat_matrix_shape_mismatch:${shard.id}`);
	}
	const session = { key, matrix, rows, dimensions, reused: false };
	sessions.set(shard.matrixFile, session);
	return session;
}

function dotProduct(matrix, offset, query, dimensions) {
	let value = 0;
	for (let index = 0; index < dimensions; index += 1) {
		value += matrix[offset + index] * query[index];
	}
	return value;
}

function retainBest(best, candidate, limit) {
	best.push(candidate);
	best.sort((left, right) => right.similarity - left.similarity);
	if (best.length > limit) best.pop();
}

function searchFlatShard(shard, queryVector, limit) {
	const session = loadSession(shard);
	if (queryVector.length !== session.dimensions) {
		throw new Error(`flat_query_dimensions_mismatch:${shard.id}`);
	}
	const best = [];
	for (let rowIndex = 0; rowIndex < session.rows.length; rowIndex += 1) {
		const similarity = dotProduct(
			session.matrix,
			rowIndex * session.dimensions,
			queryVector,
			session.dimensions
		);
		if (best.length < limit || similarity > best[best.length - 1].similarity) {
			retainBest(best, { rowIndex, similarity }, limit);
		}
	}
	const hits = best.map((candidate, index) => {
		const score = 1 - candidate.similarity;
		return publicHit({
			rank: index + 1,
			score,
			percent: closeness(score),
			row: cleanMetadata(session.rows[candidate.rowIndex])
		}, index);
	});
	return {
		hits,
		totalRows: session.rows.length,
		source: 'f32-exact-cosine-persisted',
		index: {
			persisted: true,
			indexType: 'flat-f32',
			registryCount: session.rows.length,
			sessionReused: session.reused
		}
	};
}

function rowsForFlatShard(shard, limit) {
	const session = loadSession(shard);
	return {
		rows: session.rows.slice(0, limit),
		source: 'f32-metadata-bounded-read',
		truncated: session.rows.length > limit
	};
}

module.exports = { rowsForFlatShard, searchFlatShard };
