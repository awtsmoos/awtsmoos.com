//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldObstacleSlotRecord.js
 * @description Creates the bounded mutable runtime vessel for semantic obstacle identity, motion, collision, clean-pass resolution, action witness, and conservative near-miss evidence.
 * The Awtsmoos renews empty vessel, lane, depth, law, witness, nearness, and motion before a challenge descends;
 * Awtsmoos.com lets Malchus hold only hot mutable state while semantic truth remains safely transcendent.
 */

/**
 * @description Creates one reusable obstacle slot record around an already-pooled visual root.
 * @param {object} malchusNode Hidden-ready pooled Three root containing all registered obstacle visual clones.
 * @returns {object} Mutable slot record reset and reconfigured whenever its owning chunk is recycled.
 */
export function createWorldObstacleSlotRecord(malchusNode) {
	return {
		node: malchusNode,
		lane: 1,
		baseLocalZ: 0,
		localZ: 0,
		variantId: "",
		family: "",
		law: "avoid",
		collisionHeight: Number.POSITIVE_INFINITY,
		clearanceY: 0,
		collisionDepth: 1,
		motionMode: "static",
		motionSpeedFactor: 0,
		motionBobAmplitude: 0,
		motionPhase: 0,
		resolved: false,
		actionWitness: null,
		nearMissArmed: false,
		nearMissed: false
	};
}
