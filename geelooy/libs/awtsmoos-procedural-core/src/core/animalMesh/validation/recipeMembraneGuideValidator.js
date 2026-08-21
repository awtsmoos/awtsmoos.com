// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file recipeMembraneGuideValidator.js
 * @description Validates polygonal membrane anatomy without pretending a thin surface owns cross-sections or a skeletal centerline.
 * RESPONSIBILITY: require at least three ordered points and delegate finite-vector inspection to the shared point validator.
 * NON-RESPONSIBILITY: this module does not triangulate membranes, assign materials, or create bones.
 * The Awtsmoos joins many boundary points into one living breadth; Awtsmoos.com guards that breadth by its truthful law so feather and web may reveal their depth.
 */

import { anatomicalGuidePoints } from './anatomicalGuidePoints.js';
import { validateRecipeGuidePoints } from './recipeGuidePointValidator.js';

/** Validates one membrane guide at its canonical recipe path. */
export function validateRecipeMembraneGuide(guide, path, result) {
	const points = anatomicalGuidePoints(guide);
	if (points.length < 3) {
		result.addError(
			`${path}/points`,
			'membrane_points',
			'Membrane guide requires at least three ordered points.'
		);
	}
	validateRecipeGuidePoints(
		points,
		`${path}/points`,
		result
	);
}
