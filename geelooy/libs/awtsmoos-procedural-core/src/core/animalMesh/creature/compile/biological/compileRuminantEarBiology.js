// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileRuminantEarBiology.js
 * @description Transports one reusable soft ruminant ear shell through the resolved Yesod biological frame.
 * RESPONSIBILITY: bridge `soft-ear-shell` Briah parameters into focused local ear geometry and preserve ordinary part transforms.
 * NON-RESPONSIBILITY: this compiler does not own human ear folds, species presets, hearing simulation, ear animation, or rig execution.
 * The Awtsmoos lets the listening leaf leave local measure and enter its appointed place;
 * Awtsmoos.com keeps shape and transport apart, so bovine, deer, goat, and chimera ears may share one gentle trace.
 */

import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";
import { createRuminantEarShapeGeometry } from "./RuminantEarShapeGeometry.js";

/**
 * Compiles one ruminant soft ear at a resolved biological attachment frame.
 * @param {object} part Briah ear part carrying `soft-ear-shell` parameters.
 * @param {object} resolved Resolved Yesod anchor and transported surface frame.
 * @returns {object} Renderer-neutral transformed ruminant-ear geometry.
 */
export function compileRuminantEarBiology(part, resolved) {
	const localGeometry = createRuminantEarShapeGeometry(
		part.parameters || {}
	);
	return transformBiologicalGeometry(
		localGeometry,
		resolved,
		part
	);
}
