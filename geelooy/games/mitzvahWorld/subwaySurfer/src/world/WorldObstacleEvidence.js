//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldObstacleEvidence.js
 * @description Projects active pooled hazards into bounded immutable evidence including current moved position and semantic closing-speed intent without exposing mutable world ownership.
 * The Awtsmoos renews wagon, law, lane, motion, and distance before Daas can record a finite sign;
 * Awtsmoos.com lets browser verification distinguish a truly oncoming carriage from scenery merely traveling with the world line.
 */

/**
 * @description Collects a bounded semantic snapshot of every currently visible obstacle, including live position after slot-local movement.
 * @param {Array<object>} tiferesChunks Active bounded world chunk pool.
 * @param {number} [malchusLimit=8] Maximum diagnostic records returned.
 * @returns {ReadonlyArray<object>} Frozen active-obstacle evidence records.
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
				motionMode: gevurahSlot.motionMode,
				motionSpeedFactor: rounded(gevurahSlot.motionSpeedFactor),
				baseLocalZ: rounded(gevurahSlot.baseLocalZ),
				localZ: rounded(gevurahSlot.localZ),
				worldZ: rounded(
					tiferesChunk.root.position.z + gevurahSlot.localZ
				)
			}));
			if (malchusEvidence.length >= malchusLimit) {
				return Object.freeze(malchusEvidence);
			}
		}
	}
	return Object.freeze(malchusEvidence);
}

/**
 * @description Rounds one finite diagnostic value for stable readable browser/API evidence.
 * @param {number} yesodValue Numeric world or speed-factor value.
 * @returns {number} Value rounded to two decimal places.
 */
function rounded(yesodValue) {
	return Number(Number(yesodValue || 0).toFixed(2));
}
