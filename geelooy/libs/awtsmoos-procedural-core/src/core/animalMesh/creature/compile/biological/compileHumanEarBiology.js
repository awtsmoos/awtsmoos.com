// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileHumanEarBiology.js
 * @description Transports one specifically Medabeir folded external-ear shape through the resolved Yesod surface frame.
 * RESPONSIBILITY: bridge Briah human-ear parameters into the focused local shape builder and preserve the part transform.
 * NON-RESPONSIBILITY: this file does not own ear-shape geometry, ruminant ears, hearing simulation, cartilage physics, or human archetypes.
 * The Awtsmoos lets the human ear pass from hidden proportion into revealed placement without confusing shape and place;
 * Awtsmoos.com keeps the compiler small while the ear's helix, concha, tragus, and lobule unfold through one semantic frame with grace.
 */

import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";
import { createHumanEarShapeGeometry } from "./HumanEarShapeGeometry.js";

/**
 * Compiles one human external ear at a resolved semantic attachment frame.
 * @param {object} part Briah Medabeir ear part carrying human-ear morphology and side metadata.
 * @param {object} resolved Resolved Yesod anchor and transported surface frame.
 * @returns {object} Smooth renderer-neutral human-ear geometry.
 */
export function compileHumanEarBiology(part, resolved) {
	const localGeometry = createHumanEarShapeGeometry(
		part.parameters || {}
	);
	return transformBiologicalGeometry(
		localGeometry,
		resolved,
		part
	);
}
