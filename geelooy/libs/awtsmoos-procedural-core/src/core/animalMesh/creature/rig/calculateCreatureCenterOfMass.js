// B"H
// Boruch Hashem
// Blessed is He

import {
	addVector,
	scaleVector
} from "../shared/creatureValue.js";

/**
 * Calculates Briah center of mass from stable axial section contributions.
 * @param {Object} creature - Authoritative Briah creature.
 * @returns {number[]} Deterministic three-dimensional center of mass.
 * @complexity O(s) for s axial sections.
 * @sideEffects None.
 */
export function calculateCreatureCenterOfMass(creature) {
	const totalMass = Math.max(
		1,
		creature.body.sections.reduce(
			(sum, section) => sum + section.massContribution,
			0
		)
	);
	return creature.body.sections.reduce(
		(sum, section) => addVector(
			sum,
			scaleVector(section.position, section.massContribution)
		),
		[0, 0, 0]
	).map((value) => value / totalMass);
}
