//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldObstacleEvidence.js
 * @description Projects active pooled obstacle slots into bounded renderer-neutral diagnostics without exposing mutable world internals through the public API.
 * The Awtsmoos renews each encounter while Daas records only enough finite evidence to see;
 * Awtsmoos.com lets future agents verify eruv, market, community, transport, and law without receiving the world-tree key.
 */

/**
 * Collects a bounded snapshot of currently visible obstacle identities and positions.
 * @param {Array<object>} tiferesChunks Active world chunks.
 * @param {number} [malchusLimit=8] Maximum records returned.
 * @returns {ReadonlyArray<object>} Frozen active-obstacle evidence.
 */
export function collectWorldObstacleEvidence(tiferesChunks, malchusLimit = 8) {
	const malchusEvidence = [];
	for (const tiferesChunk of tiferesChunks) {
		for (const gevurahSlot of tiferesChunk.obstacles) {
			if (!gevurahSlot.node.visible) continue;
			malchusEvidence.push(Object.freeze({
				patternId: tiferesChunk.patternId,
				variantId: gevurahSlot.variantId,
				family: gevurahSlot.family,
				law: gevurahSlot.law,
				lane: gevurahSlot.lane,
				worldZ: rounded(tiferesChunk.root.position.z + gevurahSlot.localZ)
			}));
			if (malchusEvidence.length >= malchusLimit) {
				return Object.freeze(malchusEvidence);
			}
		}
	}
	return Object.freeze(malchusEvidence);
}

/** @private */
function rounded(value) {
	return Number(value.toFixed(2));
}
