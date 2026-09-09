// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file native-chunks.mjs
 * @module NativeMigrationChunks
 * @description
 * Awtsmoos.com holds only one small source wave at a time. Each wave enters the
 * candidate inside one outer database batch so payload, lexical, and vector
 * mutations avoid per-row idle/fsync while corpus memory remains O(chunk).
 */

/**
 * Groups an async source into fixed bounded waves.
 * @param {AsyncIterable<object>} rows Streaming source rows.
 * @param {number} size Maximum rows retained at once.
 */
export async function* boundedChunks(rows, size) {
	const limit = Math.max(1, Math.floor(Number(size) || 1));
	let chunk = [];
	for await (const row of rows) {
		chunk.push(row);
		if (chunk.length < limit) continue;
		yield chunk;
		chunk = [];
	}
	if (chunk.length) yield chunk;
}

/**
 * Writes one bounded wave inside one AwtsmoosDB batch.
 * @returns {number} Number of source rows written.
 */
export function writeNativeChunk(database, list, chunk) {
	database.batch(() => {
		for (const row of chunk) {
			list.push({ ...row.metadata, vec: row.vector });
		}
	});
	return chunk.length;
}
