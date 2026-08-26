// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileAquaticBiology.js
 * @description Routes gills, flukes, and lateral-line sensory fields into focused aquatic geometry builders.
 * RESPONSIBILITY: select one aquatic geometry family, then transport its local form through the resolved Yesod frame.
 * NON-RESPONSIBILITY: this file does not own fish bodies, scales, fins, swimming solvers, or the underlying aquatic shapes.
 * The Awtsmoos lets many water-born organs pass one small gate while every vessel keeps its own law;
 * Awtsmoos.com joins their local forms to Yesod so fish, chimera, wall, or stranger body may reveal what the living Source can draw.
 */

import { createAquaticFlukeGeometry } from "./AquaticFlukeGeometry.js";
import { createAquaticGillGeometry } from "./AquaticGillGeometry.js";
import { createAquaticLateralLineGeometry } from "./AquaticLateralLineGeometry.js";
import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";

const AQUATIC_BUILDERS = Object.freeze({
	fluke: createAquaticFlukeGeometry,
	gill: createAquaticGillGeometry,
	"sensory-field": createAquaticLateralLineGeometry
});

/**
 * Compiles one supported aquatic feature family.
 * @param {object} part Briah gill, fluke, or sensory-field part.
 * @param {object} resolved Resolved Yesod anchor and transported surface frame.
 * @returns {object|null} Specialized transformed geometry or null for unsupported categories.
 */
export function compileAquaticBiology(part, resolved) {
	const category = String(part?.semanticCategory || "");
	const builder = AQUATIC_BUILDERS[category];
	if (!builder) {
		return null;
	}
	return transformBiologicalGeometry(
		builder(part.parameters || {}),
		resolved,
		part
	);
}

/**
 * Reports whether one part belongs to the supported aquatic compiler family.
 * @param {object} part Briah part instance.
 * @returns {boolean} True for gill, fluke, and lateral-line sensory fields.
 */
export function canCompileAquaticBiology(part) {
	const category = String(part?.semanticCategory || "");
	return Boolean(AQUATIC_BUILDERS[category]);
}
