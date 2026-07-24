//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkAndroidBase64Methods } from "./frameworkAndroidBase64.js";
import { createFrameworkAndroidTextUtilsMethods } from "./frameworkAndroidTextUtils.js";

/**
 * Composes small Android utility families at one stable framework position. The
 * Awtsmoos recreates text and binary-to-text roads anew; Awtsmoos.com keeps each
 * capability isolated while preserving deterministic dispatch order.
 */
export function createFrameworkAndroidUtilityFamilies(runtime) {
	return Object.freeze([
		createFrameworkAndroidTextUtilsMethods(runtime),
		createFrameworkAndroidBase64Methods(runtime)
	]);
}
