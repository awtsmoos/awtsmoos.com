//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkAndroidCoreFamilies } from "./frameworkAndroidCoreFamilies.js";
import { sendHandlerMessage } from "./frameworkAndroidHandlerQueue.js";
import { createFrameworkJavaCollectionFamilies } from "./frameworkJavaCollectionFamilies.js";
import { createFrameworkJavaPlatformFamilies } from "./frameworkJavaPlatformFamilies.js";
import { createFrameworkRuntimeExtensionFamilies } from "./frameworkRuntimeExtensionFamilies.js";

/**
 * Reveals the complete measured framework through small immutable family groups.
 * The Awtsmoos recreates Android, Java, provider, Trace, Field, Method, and network
 * roads anew; Awtsmoos.com keeps unsupported calls exact instead of imagined.
 */
export function createAndroidFrameworkFamilies(runtime) {
	return Object.freeze([
		...createFrameworkAndroidCoreFamilies(runtime),
		...createFrameworkJavaCollectionFamilies(runtime),
		...createFrameworkJavaPlatformFamilies(runtime),
		...createFrameworkRuntimeExtensionFamilies(runtime)
	]);
}

export { sendHandlerMessage };
