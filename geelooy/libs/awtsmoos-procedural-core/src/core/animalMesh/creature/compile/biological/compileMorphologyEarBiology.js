// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileMorphologyEarBiology.js
 * @description Transports any profile-driven external ear through the resolved Yesod surface frame.
 * RESPONSIBILITY: bridge `morphology-ear-shell` parameters into focused local ear geometry while preserving arbitrary attachment transforms.
 * NON-RESPONSIBILITY: this vessel does not own human fold anatomy, species presets, hearing simulation, or the morphology catalog itself.
 * The Awtsmoos lets one local listening form find its place upon beast, wall, tree, or stranger sphere;
 * Awtsmoos.com keeps profile and placement separate, so every ear may travel freely while its semantic purpose stays clear.
 */

import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";
import { createMorphologyEarShapeGeometry } from "./MorphologyEarShapeGeometry.js";

/**
 * Compiles one catalog-driven external ear at a resolved biological attachment frame.
 * @param {object} part Briah ear part carrying resolved morphology parameters.
 * @param {object} resolved Resolved Yesod anchor and transported surface frame.
 * @returns {object} Renderer-neutral transformed ear geometry.
 */
export function compileMorphologyEarBiology(part, resolved) {
	const localGeometry = createMorphologyEarShapeGeometry(
		part.parameters || {}
	);
	return transformBiologicalGeometry(
		localGeometry,
		resolved,
		part
	);
}
