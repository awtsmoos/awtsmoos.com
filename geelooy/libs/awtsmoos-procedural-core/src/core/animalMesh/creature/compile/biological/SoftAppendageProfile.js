// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SoftAppendageProfile.js
 * @description Dispatches explicit continuous-appendage geometry recipes into focused deterministic curve laws.
 * RESPONSIBILITY: select the correct local profile family without owning mesh creation, species identity, or renderer behavior.
 * NON-RESPONSIBILITY: this module does not guess from broad categories; new forms must opt into an explicit geometry recipe.
 * The Awtsmoos remains One while many centerlines reveal hanging, sensing, grasping, feeding, carrying, and luminous intent;
 * Awtsmoos.com keeps the dispatcher small, so new biological revelation adds a vessel instead of making one monolith bent.
 */

import {
	createFlexibleTaperedCurve,
	createHangingSoftCurve,
	createLureCurve,
	createPrehensileCurve,
	createProboscisCurve,
	createTentacleCurve,
	createTrunkCurve
} from "./SoftAppendageCurves.js";

const PROFILE_BY_RECIPE = Object.freeze({
	"flexible-tapered-tube": createFlexibleTaperedCurve,
	"hanging-soft-tube": createHangingSoftCurve,
	"lure-stalk": createLureCurve,
	"prehensile-tube": createPrehensileCurve,
	"proboscis-tube": createProboscisCurve,
	"tentacle-loft": createTentacleCurve,
	"trunk-loft": createTrunkCurve
});

/**
 * Creates one bounded local profile from an explicit continuous appendage recipe.
 * @param {object} [parameters={}] Briah morphology with `biologicalGeometryRecipe`.
 * @returns {object} Centerline, radii, and loft budgets.
 */
export function createSoftAppendageProfile(parameters = {}) {
	const recipe = String(parameters.biologicalGeometryRecipe || "flexible-tapered-tube");
	const profileFactory = PROFILE_BY_RECIPE[recipe] || createFlexibleTaperedCurve;
	return profileFactory(parameters);
}
