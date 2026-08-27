//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkAndroidAccessibilityMethods } from "./frameworkAndroidAccessibility.js";
import { createFrameworkAndroidActivityManagerMethods } from "./frameworkAndroidActivityManager.js";
import { createFrameworkAndroidDirectoryMethods } from "./frameworkAndroidDirectories.js";
import { createFrameworkAndroidDisplayMethods } from "./frameworkAndroidDisplays.js";
import { createFrameworkAndroidGraphicsMethods } from "./frameworkAndroidGraphics.js";
import { createFrameworkAndroidHandlerMethods } from "./frameworkAndroidHandlers.js";
import { sendHandlerMessage } from "./frameworkAndroidHandlerQueue.js";
import { createFrameworkAndroidInputMethodMethods } from "./frameworkAndroidInputMethods.js";
import { createFrameworkAndroidLooperMethods } from "./frameworkAndroidLoopers.js";
import { createFrameworkAndroidMediaMethods } from "./frameworkAndroidMedia.js";
import { createFrameworkAndroidMessageMethods } from "./frameworkAndroidMessages.js";
import { createFrameworkAndroidLongSparseArrayMethods } from "./frameworkAndroidLongSparseArrays.js";
import { createFrameworkAndroidResourceMethods } from "./frameworkAndroidResources.js";
import { createFrameworkAndroidServiceMethods } from "./frameworkAndroidServices.js";
import { createFrameworkAndroidSettingsMethods } from "./frameworkAndroidSettings.js";
import { createFrameworkAndroidSparseArrayMethods } from "./frameworkAndroidSparseArrays.js";
import { createFrameworkAndroidSystemClockMethods } from "./frameworkAndroidSystemClock.js";
import { createFrameworkAndroidUtilityFamilies } from "./frameworkAndroidUtilityFamilies.js";
import { createFrameworkAndroidWindowInsetsMethods } from "./frameworkAndroidWindowInsets.js";
import { createFrameworkApplicationMethods } from "./frameworkApplications.js";
import { createFrameworkAssetMethods } from "./frameworkAssets.js";
import { createFrameworkBundleMethods } from "./frameworkBundles.js";
import { createFrameworkComponentMethods } from "./frameworkComponents.js";
import { createFrameworkConstructors } from "./frameworkConstructors.js";
import { createFrameworkContentObserverMethods } from "./frameworkContentObservers.js";
import { createFrameworkContentResolverMethods } from "./frameworkContentResolvers.js";
import { createFrameworkFlutterJniBootstrapMethods } from "./frameworkFlutterJniBootstrapMethods.js";
import { createFrameworkFlutterJniMethods } from "./frameworkFlutterJNI.js";
import { createFrameworkFlutterPlatformMessageMethods } from "./frameworkFlutterPlatformMessages.js";
import { createFrameworkIntentMethods } from "./frameworkIntents.js";
import { createFrameworkNetworkMethods } from "./frameworkNetwork.js";
import { createFrameworkPackageMethods } from "./frameworkPackages.js";
import { createFrameworkPreferenceMethods } from "./frameworkPreferences.js";
import { createFrameworkSurfaceViewMethods } from "./frameworkSurfaceViews.js";
import { createFrameworkViewMethods } from "./frameworkViews.js";
import { createFrameworkWebGlesMethods } from "./frameworkWebGles.js";

/**
 * Composes Android roads from measured specificity toward broad fallbacks.
 * The Awtsmoos recreates every crossing; Awtsmoos.com keeps established
 * precedence stable while disjoint new families join without shifting it.
 */
export function createFrameworkAndroidCoreFamilies(runtime) {
	return Object.freeze([
		createFrameworkComponentMethods(runtime),
		createFrameworkIntentMethods(runtime),
		createFrameworkPackageMethods(runtime),
		createFrameworkApplicationMethods(runtime),
		createFrameworkPreferenceMethods(runtime),
		createFrameworkAssetMethods(runtime),
		createFrameworkBundleMethods(runtime),
		createFrameworkAndroidActivityManagerMethods(runtime),
		createFrameworkAndroidDirectoryMethods(runtime),
		createFrameworkAndroidResourceMethods(runtime),
		createFrameworkAndroidServiceMethods(runtime),
		createFrameworkAndroidHandlerMethods(runtime),
		createFrameworkContentResolverMethods(runtime),
		createFrameworkContentObserverMethods(runtime),
		createFrameworkAndroidMessageMethods(runtime, sendHandlerMessage),
		createFrameworkAndroidLooperMethods(runtime),
		createFrameworkAndroidSystemClockMethods(runtime),
		createFrameworkAndroidLongSparseArrayMethods(runtime),
		createFrameworkAndroidSparseArrayMethods(runtime),
		...createFrameworkAndroidUtilityFamilies(runtime),
		createFrameworkAndroidAccessibilityMethods(runtime),
		createFrameworkAndroidGraphicsMethods(runtime),
		createFrameworkAndroidMediaMethods(runtime),
		createFrameworkAndroidDisplayMethods(runtime),
		createFrameworkAndroidWindowInsetsMethods(runtime),
		createFrameworkSurfaceViewMethods(runtime),
		createFrameworkViewMethods(runtime),
		createFrameworkWebGlesMethods(runtime),
		createFrameworkFlutterPlatformMessageMethods(runtime),
		createFrameworkFlutterJniMethods(runtime),
		createFrameworkFlutterJniBootstrapMethods(runtime),
		createFrameworkNetworkMethods(runtime),
		createFrameworkConstructors(runtime),
		createFrameworkAndroidSettingsMethods(runtime),
		createFrameworkAndroidInputMethodMethods(runtime)
	]);
}
