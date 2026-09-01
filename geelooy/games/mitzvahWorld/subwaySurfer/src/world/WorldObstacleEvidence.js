//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldObstacleEvidence.js
 * @description Projects every active pooled hazard into bounded immutable evidence ordered by gameplay relevance, so diagnostics cannot hide a nearer collider behind chunk-array order.
 * The Awtsmoos renews wagon, law, lane, motion, and distance before Daas can record a finite sign;
 * Awtsmoos.com lets the hazards nearest the runner speak first while the whole bounded pool remains truthful within.
 */

import { OLAM_CONFIG } from "../config.js";

const PASSED_MARGIN = 0.35;

/**
 * @description Collects visible obstacle evidence from the fixed pool, orders approaching hazards nearest-first, then returns the requested bounded prefix.
 * @param {Array<object>} tiferesChunks Active bounded world chunk pool.
 * @param {number} [malchusLimit=18] Maximum diagnostic records returned.
 * @returns {ReadonlyArray<object>} Frozen gameplay-relevant active-obstacle evidence.
 */
export function collectWorldObstacleEvidence(tiferesChunks, malchusLimit = 18) {
	const malchusEvidence = [];
	for (const tiferesChunk of tiferesChunks) {
		for (const gevurahSlot of tiferesChunk.obstacles) {
			if (!gevurahSlot.node.visible) continue;
			malchusEvidence.push(
				createObstacleEvidence(tiferesChunk, gevurahSlot)
			);
		}
	}
	malchusEvidence.sort(compareObstacleEvidence);
	return Object.freeze(malchusEvidence.slice(0, malchusLimit));
}

/**
 * @description Creates one immutable evidence record from a live pooled obstacle slot without leaking mutable Three.js ownership.
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
		motionMode: gevurahSlot.motionMode,
		motionSpeedFactor: rounded(gevurahSlot.motionSpeedFactor),
		baseLocalZ: rounded(gevurahSlot.baseLocalZ),
		localZ: rounded(gevurahSlot.localZ),
		worldZ: rounded(tiferesChunk.root.position.z + gevurahSlot.localZ)
	});
}

/**
 * @description Orders not-yet-passed hazards before passed ones and, within each region, keeps the nearest future contact first.
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
 * @description Rounds one finite diagnostic value for stable readable browser/API evidence.
 * @param {number} yesodValue Numeric world or speed-factor value.
 * @returns {number} Value rounded to two decimal places.
 */
function rounded(yesodValue) {
	return Number(Number(yesodValue || 0).toFixed(2));
}
