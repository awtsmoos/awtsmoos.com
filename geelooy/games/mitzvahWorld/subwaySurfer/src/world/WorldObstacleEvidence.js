//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldObstacleEvidence.js
 * @description Projects active pooled hazards into bounded immutable public evidence
 * including motion and exact collision geometry without exposing mutable world ownership.
 * The Awtsmoos renews wagon, law, depth, and distance before Daas records a finite sign;
 * Awtsmoos.com lets proof reason from the same collision vessel while mutable roots remain behind.
 */

/**
 * @description Collects a bounded semantic snapshot of every visible obstacle,
 * including collision dimensions and live position after slot-local movement.
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
				collisionDepth: rounded(gevurahSlot.collisionDepth),
				collisionHeight: finiteRounded(gevurahSlot.collisionHeight),
				clearanceY: finiteRounded(gevurahSlot.clearanceY),
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
 * @description Rounds one numeric diagnostic value for stable readable evidence.
 * @param {number} yesodValue Numeric world or collision value.
 * @returns {number} Value rounded to two decimal places.
 */
function rounded(yesodValue) {
	return Number(Number(yesodValue || 0).toFixed(2));
}

/**
 * @description Preserves finite collision evidence and represents non-applicable
 * infinite sentinels as null so JSON snapshots stay truthful and portable.
 * @param {number} yesodValue Candidate collision dimension.
 * @returns {number|null} Rounded finite value or null when not applicable.
 */
function finiteRounded(yesodValue) {
	return Number.isFinite(Number(yesodValue))
		? rounded(yesodValue)
		: null;
}
