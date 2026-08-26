// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileHumanHandBiology.js
 * @description Transports a specifically Medabeir five-digit hand shape through the resolved Yesod attachment frame.
 * RESPONSIBILITY: bridge Briah human-hand parameters into the focused local shape builder and preserve the biological part transform.
 * NON-RESPONSIBILITY: this file does not own palm/digit geometry, arm anatomy, inverse kinematics, materials, or human archetypes.
 * The Awtsmoos lets the human hand carry deed through one small bridge from hidden law to revealed form;
 * Awtsmoos.com keeps shape and placement separate so five fingers and opposable thumb may remain reusable beyond one body's norm.
 */

import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";
import { createHumanHandShapeGeometry } from "./HumanHandShapeGeometry.js";

/**
 * Compiles one human hand with a palm, five digits, and side-aware thumb opposition.
 * @param {object} part Briah Medabeir hand part carrying human-hand morphology.
 * @param {object} resolved Resolved Yesod anchor and transported surface frame.
 * @returns {object} Smooth transformed human-hand geometry.
 */
export function compileHumanHandBiology(part, resolved) {
	return transformBiologicalGeometry(
		createHumanHandShapeGeometry(part.parameters || {}),
		resolved,
		part
	);
}
