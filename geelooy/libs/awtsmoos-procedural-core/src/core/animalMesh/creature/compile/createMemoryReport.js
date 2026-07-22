// B"H
// Boruch Hashem
// Blessed is He
/**
 * Memory is counted honestly as one more finite vessel. The Awtsmoos gives
 * Awtsmoos.com exact typed-array bytes without contaminating deterministic IDs.
 */

function partBytes(part) {
	return (part.positions?.byteLength || 0)
		+ (part.normals?.byteLength || 0)
		+ (part.indices?.byteLength || 0)
		+ (part.uvs?.byteLength || 0);
}

/** Reports geometry, skin, texture, temporary, and optional compile time cost. */
export function createCreatureMemoryReport(parts, startedAt, deterministic) {
	const geometryBytes = parts.reduce(
		(sum, part) => sum + partBytes(part),
		0
	);
	const skinBytes = parts.reduce(
		(sum, part) => sum
			+ (part.skinIndices?.byteLength || 0)
			+ (part.skinWeights?.byteLength || 0),
		0
	);
	return Object.freeze({
		geometryBytes,
		skinBytes,
		textureBytes: 0,
		temporaryBytes: geometryBytes,
		compileMilliseconds: deterministic
			? 0
			: Math.max(0, Date.now() - startedAt)
	});
}
