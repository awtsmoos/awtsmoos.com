//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkAndroidActivityManagerMethods } from "./frameworkAndroidActivityManager.js";
import { createFrameworkAndroidDirectoryMethods } from "./frameworkAndroidDirectories.js";
import { createFrameworkAndroidHandlerMethods } from "./frameworkAndroidHandlers.js";
import { sendHandlerMessage } from "./frameworkAndroidHandlerQueue.js";
import { createFrameworkAndroidLooperMethods } from "./frameworkAndroidLoopers.js";
import { createFrameworkAndroidMessageMethods } from "./frameworkAndroidMessages.js";
import { createFrameworkAndroidLongSparseArrayMethods } from "./frameworkAndroidLongSparseArrays.js";
import { createFrameworkAndroidResourceMethods } from "./frameworkAndroidResources.js";
import { createFrameworkAndroidServiceMethods } from "./frameworkAndroidServices.js";
import { createFrameworkAndroidSparseArrayMethods } from "./frameworkAndroidSparseArrays.js";
import { createFrameworkAndroidSystemClockMethods } from "./frameworkAndroidSystemClock.js";
import { createFrameworkAndroidUtilityFamilies } from "./frameworkAndroidUtilityFamilies.js";
import { createFrameworkApplicationMethods } from "./frameworkApplications.js";
import { createFrameworkAssetMethods } from "./frameworkAssets.js";
import { createFrameworkBundleMethods } from "./frameworkBundles.js";
import { createFrameworkComponentMethods } from "./frameworkComponents.js";
import { createFrameworkContentObserverMethods } from "./frameworkContentObservers.js";
import { createFrameworkContentResolverMethods } from "./frameworkContentResolvers.js";
import { createFrameworkIntentMethods } from "./frameworkIntents.js";
import { createFrameworkPackageMethods } from "./frameworkPackages.js";
import { createFrameworkPreferenceMethods } from "./frameworkPreferences.js";

/**
 * Builds the stable foundation families in their historical precedence order.
 * The Awtsmoos recreates application, content, service, and utility roads anew;
 * Awtsmoos.com preserves their ordering while freeing the root registry from
 * horizontal density and future merge confusion.
 * @param {object} olamRuntime Android runtime vessel.
 * @returns {Array<object>} Ordered foundation framework families.
 */
export function createFrameworkAndroidCoreFoundationFamilies(olamRuntime) {
	return [
		createFrameworkComponentMethods(olamRuntime),
		createFrameworkIntentMethods(olamRuntime),
		createFrameworkPackageMethods(olamRuntime),
		createFrameworkApplicationMethods(olamRuntime),
		createFrameworkPreferenceMethods(olamRuntime),
		createFrameworkAssetMethods(olamRuntime),
		createFrameworkBundleMethods(olamRuntime),
		createFrameworkAndroidActivityManagerMethods(olamRuntime),
		createFrameworkAndroidDirectoryMethods(olamRuntime),
		createFrameworkAndroidResourceMethods(olamRuntime),
		createFrameworkAndroidServiceMethods(olamRuntime),
		createFrameworkAndroidHandlerMethods(olamRuntime),
		createFrameworkContentResolverMethods(olamRuntime),
		createFrameworkContentObserverMethods(olamRuntime),
		createFrameworkAndroidMessageMethods(olamRuntime, sendHandlerMessage),
		createFrameworkAndroidLooperMethods(olamRuntime),
		createFrameworkAndroidSystemClockMethods(olamRuntime),
		createFrameworkAndroidLongSparseArrayMethods(olamRuntime),
		createFrameworkAndroidSparseArrayMethods(olamRuntime),
		...createFrameworkAndroidUtilityFamilies(olamRuntime)
	];
}
