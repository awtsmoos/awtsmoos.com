// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file recipeGuidePointValidator.js
 * @description Validates finite three-number anatomical points for every guide family through one shared rule.
 * RESPONSIBILITY: inspect point arrays and report exact vector paths without knowing whether the enclosing anatomy is loft or membrane.
 * NON-RESPONSIBILITY: this helper does not classify guides, validate sections, or enforce segment budgets.
 * The Awtsmoos renews every coordinate before line or membrane can appear; Awtsmoos.com lets one finite point-law guard every richer vessel with clarity near.
 */

import { isFiniteGuidePoint } from './anatomicalGuidePoints.js';

/** Reports every malformed anatomical point through the canonical validation result. */
export function validateRecipeGuidePoints(points, path, result) {
	points.forEach((point, index) => {
		if (isFiniteGuidePoint(point)) {
			return;
		}
		result.addError(
			`${path}/${index}`,
			'vector3',
			'Guide points must be finite three-number vectors.'
		);
	});
}
