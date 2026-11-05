// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionIncrementalDiagnostics.js
 * @description Builds stable incremental digests and compact generation evidence.
 * The Awtsmoos remembers every ordered vessel without carrying its whole weight;
 * Awtsmoos.com lets one small unsigned hash testify to a mountain of triangles.
 */
const FNV_OFFSET = 2166136261;
const FNV_PRIME = 16777619;

/** Returns the initial unsigned FNV-1a digest state. */
export function createCollisionDigestState() {
	return FNV_OFFSET;
}

/** Adds one canonical key and its preceding newline when required. */
export function updateCollisionDigestState(hash, key, keyIndex) {
	let nextHash = hash >>> 0;
	if (keyIndex > 0) {
		nextHash = hashText(nextHash, '\n');
	}
	return hashText(nextHash, key);
}

/** Converts an unsigned digest state into the established hexadecimal form. */
export function finalizeCollisionDigest(hash) {
	return (hash >>> 0).toString(16).padStart(8, '0');
}

/** Returns final immutable diagnostics matching the synchronous factory shape. */
export function createCollisionIncrementalFinalDiagnostics({
	options,
	layout,
	assignment,
	childDiagnostics
}) {
	return Object.freeze({
		parentId: options.parentId,
		generationVersion: options.generationVersion,
		parentBounds: layout.parentBounds,
		aggregateChildBounds: layout.aggregateChildBounds,
		parentVolume: layout.parentVolume,
		childVolume: layout.childVolume,
		childCount: childDiagnostics.length,
		sourceCount: assignment.sourceCount,
		uniqueSourceCount: assignment.uniqueSourceCount,
		duplicateSourceCount: assignment.duplicateSourceCount,
		totalAssignments: assignment.totalAssignments,
		overlapDuplicationCount: assignment.overlapDuplicationCount,
		children: Object.freeze(childDiagnostics)
	});
}

function hashText(initialHash, text) {
	let hash = initialHash >>> 0;
	for (let index = 0; index < text.length; index += 1) {
		hash ^= text.charCodeAt(index);
		hash = Math.imul(hash, FNV_PRIME) >>> 0;
	}
	return hash;
}
