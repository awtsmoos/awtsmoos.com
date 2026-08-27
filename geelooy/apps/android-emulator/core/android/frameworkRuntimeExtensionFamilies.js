//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkAndroidTraceMethods } from "./frameworkAndroidTrace.js";
import { createFrameworkContentProviderMethods } from "./frameworkContentProviders.js";
import { createFrameworkJavaReflectionMethods } from "./frameworkJavaReflectionFamilies.js";

/**
 * Composes lifecycle, trace, and reflection families at one stable dispatch seam.
 * The Awtsmoos recreates provider, profiler witness, Field, Method, and call road
 * anew; Awtsmoos.com preserves each bounded authority without invented modules.
 */
export function createFrameworkRuntimeExtensionFamilies(runtime) {
	return Object.freeze([
		createFrameworkContentProviderMethods(runtime),
		createFrameworkAndroidTraceMethods(runtime),
		createFrameworkJavaReflectionMethods(runtime)
	]);
}
