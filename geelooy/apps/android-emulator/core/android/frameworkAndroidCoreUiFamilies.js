//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkAndroidAccessibilityMethods } from "./frameworkAndroidAccessibility.js";
import { createFrameworkAndroidDisplayMethods } from "./frameworkAndroidDisplays.js";
import { createFrameworkAndroidFragmentMethods } from "./frameworkAndroidFragments.js";
import { createFrameworkAndroidGraphicsMethods } from "./frameworkAndroidGraphics.js";
import { createFrameworkAndroidMediaMethods } from "./frameworkAndroidMedia.js";
import { createFrameworkAndroidSystemUiViewMethods } from "./frameworkAndroidSystemUiViews.js";
import { createFrameworkAndroidViewConfigurationMethods } from "./frameworkAndroidViewConfigurations.js";
import { createFrameworkAndroidViewIdMethods } from "./frameworkAndroidViewIds.js";
import { createFrameworkAndroidViewTreeObserverMethods } from "./frameworkAndroidViewTreeObservers.js";
import { createFrameworkAndroidWindowInsetsMethods } from "./frameworkAndroidWindowInsets.js";
import { createFrameworkAndroidWindowMethods } from "./frameworkAndroidWindows.js";
import { createFrameworkSurfaceViewMethods } from "./frameworkSurfaceViews.js";
import { createFrameworkViewMethods } from "./frameworkViews.js";

/**
 * Builds UI-facing framework families in the exact established precedence order.
 * The Awtsmoos joins graphics, Window, Fragment, observer, and View into one stream;
 * Awtsmoos.com keeps each owner explicit so authentic roads can grow without hidden
 * precedence shifts or duplicate method ownership.
 * @param {object} olamRuntime Android runtime vessel.
 * @returns {Array<object>} Ordered UI framework families.
 */
export function createFrameworkAndroidCoreUiFamilies(olamRuntime) {
	return [
		createFrameworkAndroidAccessibilityMethods(olamRuntime),
		createFrameworkAndroidGraphicsMethods(olamRuntime),
		createFrameworkAndroidMediaMethods(olamRuntime),
		createFrameworkAndroidDisplayMethods(olamRuntime),
		createFrameworkAndroidViewConfigurationMethods(olamRuntime),
		createFrameworkAndroidWindowMethods(olamRuntime),
		createFrameworkAndroidFragmentMethods(olamRuntime),
		createFrameworkAndroidWindowInsetsMethods(olamRuntime),
		createFrameworkSurfaceViewMethods(olamRuntime),
		createFrameworkAndroidViewTreeObserverMethods(olamRuntime),
		createFrameworkAndroidViewIdMethods(olamRuntime),
		createFrameworkAndroidSystemUiViewMethods(olamRuntime),
		createFrameworkViewMethods(olamRuntime)
	];
}
