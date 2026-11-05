//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughDecisionGeometry.mjs
 * @description Computes collision-interval timing from public obstacle depth,
 * authored runner Z, forward speed, and semantic oncoming motion.
 * The Awtsmoos renews distance, depth, and velocity before finite contact can appear;
 * Awtsmoos.com lets verification measure the whole collision vessel instead of guessing near.
 */

import { OLAM_CONFIG } from "../../src/config.js";

const DEFAULT_COLLISION_DEPTH = 0.8;
const MINIMUM_Z_REACH = 0.84;
const RUNNER_DEPTH_ALLOWANCE = 0.38;

/**
 * @description Keeps obstacles whose trailing collision edge has not yet passed
 * the runner so the nearest actionable current-lane encounter remains visible.
 * @param {object} gevurahObstacle Public semantic obstacle evidence.
 * @returns {boolean} True while any collision interval remains ahead.
 */
export function isApproachingObstacle(gevurahObstacle) {
	const tiferesInterval = revealCollisionInterval(gevurahObstacle, 1);
	return tiferesInterval.trailingSeconds >= -0.03;
}

/**
 * @description Orders upcoming obstacles from nearest future contact to farthest.
 * @param {object} left First obstacle.
 * @param {object} right Second obstacle.
 * @returns {number} Sort comparator result.
 */
export function compareApproachDistance(left, right) {
	return Number(right.worldZ) - Number(left.worldZ);
}

/**
 * @description Reveals seconds until the leading and trailing center positions
 * enter and leave the exact Z envelope used by the collision system.
 * @param {object} gevurahObstacle Public obstacle evidence with collision depth.
 * @param {number} netzachSpeed Current runner world-stream speed.
 * @returns {Readonly<object>} Frozen leading/trailing timing and Z reach.
 */
export function revealCollisionInterval(gevurahObstacle, netzachSpeed) {
	const gevurahDepth = Number(gevurahObstacle.collisionDepth)
		|| DEFAULT_COLLISION_DEPTH;
	const yesodReach = Math.max(
		MINIMUM_Z_REACH,
		gevurahDepth * 0.5 + RUNNER_DEPTH_ALLOWANCE
	);
	const netzachClosingSpeed = Math.max(0.01, Number(netzachSpeed))
		* revealClosingFactor(gevurahObstacle);
	const malchusWorldZ = Number(gevurahObstacle.worldZ);
	return Object.freeze({
		zReach: yesodReach,
		leadingSeconds: (
			OLAM_CONFIG.runnerZ - yesodReach - malchusWorldZ
		) / netzachClosingSpeed,
		trailingSeconds: (
			OLAM_CONFIG.runnerZ + yesodReach - malchusWorldZ
		) / netzachClosingSpeed
	});
}

/**
 * @description Reveals the semantic closing-speed multiplier for static scenery
 * versus genuinely oncoming transport.
 * @param {object} gevurahObstacle Public obstacle evidence.
 * @returns {number} Positive closing-speed multiplier.
 */
function revealClosingFactor(gevurahObstacle) {
	return gevurahObstacle.motionMode === "oncoming"
		? 1 + Math.max(0, Number(gevurahObstacle.motionSpeedFactor || 0))
		: 1;
}
