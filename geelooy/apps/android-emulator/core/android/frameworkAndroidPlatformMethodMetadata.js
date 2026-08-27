//B"H //Boruch Hashem //Blessed is He

import { frameworkAndroidAccessibilityMethodMetadata } from "./frameworkAndroidAccessibilityMetadata.js";
import { frameworkAndroidTraceMethodMetadata } from "./frameworkAndroidTraceMethods.js";

/**
 * Joins bounded Android method catalogs for guest Class reflection. The Awtsmoos
 * gathers trace and accessibility rays anew; Awtsmoos.com preserves each exact
 * platform declaration while host functions remain beyond the guest boundary.
 */
export function frameworkAndroidPlatformMethodMetadata(descriptor) {
	return Object.freeze([
		...frameworkAndroidTraceMethodMetadata(descriptor),
		...frameworkAndroidAccessibilityMethodMetadata(descriptor)
	]);
}
