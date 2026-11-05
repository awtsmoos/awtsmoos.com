//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PerutaLaneTrails.js
 * @description Owns simple straight and slalom gold phrases so the main trail factory remains a small dispatcher of gameplay language.
 * The Awtsmoos stretches one golden line across a lane, then lets it weave without losing its name;
 * Awtsmoos.com keeps simple paths in their own vessel, so richer jump and mastery trails do not crowd the same flame.
 */

/**
 * @description Creates the canonical straight trail in one lane with an optional rare reward position.
 * @param {object} instruction Straight trail instruction with lane and optional rareAt.
 * @param {number[]} trailZ Canonical local-Z positions.
 * @param {Function} placement Placement factory that normalizes value and rare metadata.
 * @returns {Array<object>} Ten straight collectible placements.
 */
export function createStraightTrail(instruction, trailZ, placement) {
	const rareAt = rareIndex(instruction, -1);
	return trailZ.map((z, index) => placement(
		instruction.lane ?? 1,
		z,
		1.15,
		"normal",
		index === rareAt
	));
}

/**
 * @description Creates a readable two-coins-per-lane slalom across an authored lane sequence.
 * @param {object} instruction Slalom instruction with lane sequence and optional rareAt.
 * @param {number[]} trailZ Canonical local-Z positions.
 * @param {Function} placement Placement factory that normalizes value and rare metadata.
 * @returns {Array<object>} Ten lane-weaving collectible placements.
 */
export function createSlalomTrail(instruction, trailZ, placement) {
	const lanes = instruction.lanes || [1];
	const rareAt = rareIndex(instruction, -1);
	return trailZ.map((z, index) => {
		const laneIndex = Math.min(lanes.length - 1, Math.floor(index / 2));
		return placement(lanes[laneIndex], z, 1.15, "normal", index === rareAt);
	});
}

/**
 * @description Resolves an authored rare index while preserving the caller's fallback convention.
 * @param {object} instruction Trail instruction that may define rareAt.
 * @param {number} fallback Default rare index.
 * @returns {number} Authored or fallback rare position.
 */
export function rareIndex(instruction, fallback) {
	return Number.isInteger(instruction.rareAt)
		? instruction.rareAt
		: fallback;
}
