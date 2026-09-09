// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module FlatMatrixReader
 * @description
 * The Awtsmoos crosses a legacy float matrix by small positional reads rather than swallowing the whole sea;
 * Awtsmoos.com bounds scan memory while the corpus journeys toward native indexed vessels.
 */

const fs = require('fs/promises');
const { retainBest, threshold } = require('./flatMatrixBest.js');

const ROWS_PER_CHUNK = 256;
const FLOAT_BYTES = 4;

/** Returns exact persisted row count after validating matrix geometry. */
async function matrixRowCount(file, dimensions) {
	const bytes = Number((await fs.stat(file)).size || 0);
	const rowBytes = dimensions * FLOAT_BYTES;
	if (!dimensions || !rowBytes || bytes % rowBytes !== 0) {
		throw new Error(`flat_matrix_shape_mismatch:${file}`);
	}
	return bytes / rowBytes;
}

/** Reads one little-endian cosine dot product directly from a bounded byte buffer. */
function dotProduct(view, byteOffset, query, dimensions) {
	let value = 0;
	for (let index = 0; index < dimensions; index += 1) {
		value += view.getFloat32(byteOffset + index * FLOAT_BYTES, true) * query[index];
	}
	return value;
}

/**
 * Scans one persisted flat matrix with a fixed-size buffer and bounded top-k memory.
 * @param {string} file Matrix path.
 * @param {ArrayLike<number>} query Query vector.
 * @param {number} dimensions Persisted vector width.
 * @param {number} limit Number of best rows to retain.
 * @returns {Promise<{best:Array<object>,totalRows:number}>} Bounded exact-scan evidence.
 */
async function scanMatrix(file, query, dimensions, limit) {
	const totalRows = await matrixRowCount(file, dimensions);
	const rowBytes = dimensions * FLOAT_BYTES;
	const chunkBytes = rowBytes * ROWS_PER_CHUNK;
	const handle = await fs.open(file, 'r');
	const best = [];
	try {
		for (let rowStart = 0; rowStart < totalRows; rowStart += ROWS_PER_CHUNK) {
			const rows = Math.min(ROWS_PER_CHUNK, totalRows - rowStart);
			const buffer = Buffer.allocUnsafe(rows * rowBytes);
			await handle.read(buffer, 0, buffer.length, rowStart * rowBytes);
			const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
			for (let local = 0; local < rows; local += 1) {
				const similarity = dotProduct(view, local * rowBytes, query, dimensions);
				if (similarity > threshold(best, limit)) {
					retainBest(best, { rowIndex: rowStart + local, similarity }, limit);
				}
			}
		}
	} finally {
		await handle.close();
	}
	return { best, totalRows };
}

module.exports = { matrixRowCount, scanMatrix };
