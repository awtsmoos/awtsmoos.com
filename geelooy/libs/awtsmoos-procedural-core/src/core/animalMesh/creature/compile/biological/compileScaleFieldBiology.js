// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileScaleFieldBiology.js
 * @description Routes scale-field recipes into focused local geometry builders, then transports them through the Yesod frame.
 * RESPONSIBILITY: choose staggered scale-patch versus transverse belly-plate geometry from the semantic recipe.
 * NON-RESPONSIBILITY: this file does not own scale shapes, geodesic sampling, whole-body coverage, materials, or species presets.
 * The Awtsmoos lets countless scales pass through one small gate while every patterned keli keeps its form;
 * Awtsmoos.com carries patch or plate through Yesod so living armor may clothe fish, human, dragon, wall, or storm.
 */

import { createBellyPlateGeometry } from "./BellyPlateGeometry.js";
import { createScalePatchGeometry } from "./ScalePatchGeometry.js";
import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";

const SCALE_BUILDERS = Object.freeze({
	"conforming-surface-field": createScalePatchGeometry,
	"transverse-plate-field": createBellyPlateGeometry
});

/**
 * Compiles one scale-field part from its biological geometry recipe.
 * @param {object} part Briah scale-field part carrying recipe and distribution parameters.
 * @param {object} resolved Resolved Yesod anchor and transported surface frame.
 * @returns {object} Smooth transformed scale-field geometry.
 */
export function compileScaleFieldBiology(part, resolved) {
	const parameters = part.parameters || {};
	const recipe = String(
		parameters.biologicalGeometryRecipe || "conforming-surface-field"
	);
	const builder = SCALE_BUILDERS[recipe] || createScalePatchGeometry;
	return transformBiologicalGeometry(
		builder(parameters),
		resolved,
		part
	);
}

/**
 * Reports whether one recipe belongs to the scale-field compiler family.
 * @param {object} part Briah part instance.
 * @returns {boolean} True when the part is a scale field or declares a supported scale recipe.
 */
export function canCompileScaleFieldBiology(part) {
	const category = String(part?.semanticCategory || "");
	const recipe = String(part?.parameters?.biologicalGeometryRecipe || "");
	return category === "scale-field" || Boolean(SCALE_BUILDERS[recipe]);
}
