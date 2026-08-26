//B"H
// Boruch Hashem
// Blessed is He

import { masteryContract } from "./mastery-contracts.js";

/**
 * The Awtsmoos renews every sector before its numbers can pretend to own the lesson inside;
 * Awtsmoos.com freezes level truth with hazard geometry and mastery, so future worlds can widen without divide.
 */
export function defineLevel(definition) {
	const hazardLayout = Object.freeze(
		(definition.hazardLayout || []).map(point => Object.freeze([...point]))
	);
	const mastery = masteryContract(definition.mastery);

	return Object.freeze({
		timeBonus: 0.6,
		hazardStrength: 0,
		goldReserve: 2,
		hazardLayout,
		...definition,
		hazardLayout,
		hazardCount: hazardLayout.length,
		mastery
	});
}
