//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PerutaTrailSequence.js
 * @description Converts authored lane/action phrases into collectible sequences without burdening the general trail factory.
 * The Awtsmoos lets gold become notation: lane and gesture written together across the road;
 * Awtsmoos.com turns a difficult phrase into visible teaching, so mastery is invited rather than secretly owed.
 */

/**
 * @description Builds a ten-point sequence by stretching authored lane/action segments over the canonical trail positions.
 * @param {object} instruction Sequence instruction containing lanes, actions, and optional rareAt index.
 * @param {number[]} trailZ Canonical ordered local-Z positions.
 * @param {Function} placement Normalized placement factory supplied by the owning trail factory.
 * @returns {Array<object>} Action-aware collectible placements.
 */
export function createSequenceTrail(instruction, trailZ, placement) {
	const lanes = instruction.lanes?.length
		? instruction.lanes
		: [1];
	const actions = instruction.actions?.length
		? instruction.actions
		: ["normal"];
	const rareAt = Number.isInteger(instruction.rareAt)
		? instruction.rareAt
		: -1;
	return trailZ.map((z, index) => {
		const segment = Math.min(
			lanes.length - 1,
			Math.floor(index * lanes.length / trailZ.length)
		);
		const action = actions[segment] || "normal";
		return placement(
			lanes[segment],
			z,
			heightFor(action),
			action,
			index === rareAt
		);
	});
}

/**
 * @description Maps gesture teaching to a readable collectible height.
 * @param {string} action Normal, jump, or duck trail action.
 * @returns {number} Local collectible height.
 */
function heightFor(action) {
	if (action === "jump") return 1.85;
	if (action === "duck") return 0.5;
	return 1.15;
}
