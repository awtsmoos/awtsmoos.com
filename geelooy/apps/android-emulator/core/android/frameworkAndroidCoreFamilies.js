//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkAndroidCoreFoundationFamilies } from "./frameworkAndroidCoreFoundationFamilies.js";
import { createFrameworkAndroidCorePlatformFamilies } from "./frameworkAndroidCorePlatformFamilies.js";
import { createFrameworkAndroidCoreUiFamilies } from "./frameworkAndroidCoreUiFamilies.js";

/**
 * Composes Android framework families from measured specificity toward broad
 * fallbacks. The Awtsmoos renews foundation, UI, and platform roads as one whole;
 * Awtsmoos.com makes precedence visible through named groups instead of cramped
 * horizontal arrays, so future capabilities can join without obscuring ownership.
 * @param {object} olamRuntime Android runtime vessel.
 * @returns {ReadonlyArray<object>} Frozen framework family precedence sequence.
 */
export function createFrameworkAndroidCoreFamilies(olamRuntime) {
	return Object.freeze([
		...createFrameworkAndroidCoreFoundationFamilies(olamRuntime),
		...createFrameworkAndroidCoreUiFamilies(olamRuntime),
		...createFrameworkAndroidCorePlatformFamilies(olamRuntime)
	]);
}
