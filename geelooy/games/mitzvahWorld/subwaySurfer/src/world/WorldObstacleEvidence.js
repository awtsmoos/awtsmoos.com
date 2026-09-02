//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldObstacleEvidence.js
 * @description Projects every active pooled hazard into bounded immutable evidence
 * ordered by gameplay relevance, including exact scalar collision geometry.
 * The Awtsmoos renews wagon, law, depth, lane, motion, and distance before Daas records a sign;
 * Awtsmoos.com lets nearest hazards speak first while mutable Three.js ownership remains behind.
 */

import { OLAM_CONFIG } from "../config.js";

const PASSED_MARGIN = 0.35;

/**
 * @description Collects visible obstacle evidence from the fixed pool, orders
 * approaching hazards nearest-first, then returns the requested bounded prefix.
 * @param {Array<object>} tiferesChunks Active bounded world chunk pool.
 * @param {number} [malchusLimit=18] Maximum diagnostic records returned.
 * @returns {ReadonlyArray<object>} Frozen gameplay-relevant obstacle evidence.
 */
export function collectWorldObstacleEvidence(tiferesChunks, malchusLimit = 18) {
	const malchusEvidence = [];
	for (const tiferesChunk of tiferesChunks) {
		for (const gevurahSlot of tiferesChunk.obstacles) {
			if (!gevurahSlot.node.visible) {
				continue;
			}
			malchusEvidence.push(createObstacleEvidence(tiferesChunk, gevurahSlot));
		}
	}
	malchusEvidence.sort(compareObstacleEvidence);
	return Object.freeze(malchusEvidence.slice(0, malchusLimit));
}

/**
 * @description Creates immutable semantic, motion, position, and collision evidence
 * without leaking mutable renderer or pooled-world object ownership.
 * @param {object} tiferesChunk Owning streamed chunk.
 * @param {object} gevurahSlot Live semantic obstacle slot.
 * @returns {Readonly<object>} Frozen obstacle evidence.
 */
function createObstacleEvidence(tiferesChunk, gevurahSlot) {
	return Object.freeze({
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
		worldZ: rounded(tiferesChunk.root.position.z + gevurahSlot.localZ)
	});
}

/**
 * @description Orders future hazards before passed ones and keeps nearest future
 * contact first inside the bounded immutable diagnostic stream.
 * @param {object} gevurahLeft First evidence record.
 * @param {object} gevurahRight Second evidence record.
 * @returns {number} Array-sort ordering value.
 */
function compareObstacleEvidence(gevurahLeft, gevurahRight) {
	const yesodThreshold = OLAM_CONFIG.runnerZ + PASSED_MARGIN;
	const leftUpcoming = gevurahLeft.worldZ <= yesodThreshold;
	const rightUpcoming = gevurahRight.worldZ <= yesodThreshold;
	if (leftUpcoming !== rightUpcoming) {
		return leftUpcoming ? -1 : 1;
	}
	return leftUpcoming
		? gevurahRight.worldZ - gevurahLeft.worldZ
		: gevurahLeft.worldZ - gevurahRight.worldZ;
}

/**
 * @description Rounds one numeric diagnostic value for stable readable evidence.
 * @param {number} yesodValue Numeric world, collision, or speed-factor value.
 * @returns {number} Value rounded to two decimal places.
 */
function rounded(yesodValue) {
	return Number(Number(yesodValue || 0).toFixed(2));
}

/**
 * @description Preserves finite collision evidence and maps non-applicable infinite
 * sentinels to null so JSON diagnostics remain truthful and portable.
 * @param {number} yesodValue Candidate collision dimension.
 * @returns {number|null} Rounded finite value or null when not applicable.
 */
function finiteRounded(yesodValue) {
	return Number.isFinite(Number(yesodValue))
		? rounded(yesodValue)
		: null;
}
