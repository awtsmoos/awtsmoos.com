//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkAndroidActivityManagerMethods } from "./frameworkAndroidActivityManager.js";
import { createFrameworkAndroidDirectoryMethods } from "./frameworkAndroidDirectories.js";
import { createFrameworkAndroidDisplayMethods } from "./frameworkAndroidDisplays.js";
import { createFrameworkAndroidGeometryMethods } from "./frameworkAndroidGeometry.js";
import { createFrameworkAndroidHandlerMethods } from "./frameworkAndroidHandlers.js";
import { sendHandlerMessage } from "./frameworkAndroidHandlerQueue.js";
import { createFrameworkAndroidLongSparseArrayMethods } from "./frameworkAndroidLongSparseArrays.js";
import { createFrameworkAndroidLooperMethods } from "./frameworkAndroidLoopers.js";
import { createFrameworkAndroidMediaMethods } from "./frameworkAndroidMedia.js";
import { createFrameworkAndroidMessageMethods } from "./frameworkAndroidMessages.js";
import { createFrameworkAndroidResourceMethods } from "./frameworkAndroidResources.js";
import { createFrameworkAndroidServiceMethods } from "./frameworkAndroidServices.js";
import { createFrameworkAndroidSparseArrayMethods } from "./frameworkAndroidSparseArrays.js";
import { createFrameworkAndroidSystemClockMethods } from "./frameworkAndroidSystemClock.js";
import { createFrameworkAndroidTraceMethods } from "./frameworkAndroidTrace.js";
import { createFrameworkAndroidWindowInsetsMethods } from "./frameworkAndroidWindowInsets.js";
import { createFrameworkAssetMethods } from "./frameworkAssets.js";
import { createFrameworkAtomicMethods } from "./frameworkAtomics.js";
import { createFrameworkBundleMethods } from "./frameworkBundles.js";
import { createFrameworkComponentMethods } from "./frameworkComponents.js";
import { createFrameworkConstructors } from "./frameworkConstructors.js";
import { createFrameworkFlutterJniMethods } from "./frameworkFlutterJNI.js";
import { createFrameworkFlutterPlatformMessageMethods } from "./frameworkFlutterPlatformMessages.js";
import { createFrameworkIntentMethods } from "./frameworkIntents.js";
import { createFrameworkJavaArraysMethods } from "./frameworkJavaArrays.js";
import { createFrameworkJavaClassMethods } from "./frameworkJavaClasses.js";
import { createFrameworkJavaCollectionWrapperMethods } from "./frameworkJavaCollectionWrappers.js";
import { createFrameworkJavaCollectionsMethods } from "./frameworkJavaCollections.js";
import { createFrameworkJavaComparatorMethods } from "./frameworkJavaComparators.js";
import { createFrameworkJavaConcurrentQueueMethods } from "./frameworkJavaConcurrentQueues.js";
import { createFrameworkJavaCopyOnWriteMethods } from "./frameworkJavaCopyOnWrite.js";
import { createFrameworkJavaDesugarObjectMethods } from "./frameworkJavaDesugarObjects.js";
import { createFrameworkJavaEnumerationMethods } from "./frameworkJavaEnumerations.js";
import { createFrameworkJavaExecutorMethods } from "./frameworkJavaExecutors.js";
import { createFrameworkJavaFileMethods } from "./frameworkJavaFiles.js";
import { createFrameworkJavaFutureMethods } from "./frameworkJavaFutures.js";
import { createFrameworkJavaIteratorMethods } from "./frameworkJavaIterators.js";
import { createFrameworkJavaListMethods } from "./frameworkJavaLists.js";
import { createFrameworkJavaLockMethods } from "./frameworkJavaLocks.js";
import { createFrameworkJavaMapMethods } from "./frameworkJavaMaps.js";
import { createFrameworkJavaObjectMethods } from "./frameworkJavaObjects.js";
import { createFrameworkJavaPriorityQueueMethods } from "./frameworkJavaPriorityQueues.js";
import { createFrameworkJavaReferenceMethods } from "./frameworkJavaReferences.js";
import { createFrameworkJavaReflectFieldMethods } from "./frameworkJavaReflectFields.js";
import { createFrameworkJavaSetMethods } from "./frameworkJavaSets.js";
import { createFrameworkJavaStringMethods } from "./frameworkJavaStrings.js";
import { createFrameworkJavaSystemMethods } from "./frameworkJavaSystem.js";
import { createFrameworkJavaThreadMethods } from "./frameworkJavaThreads.js";
import { createFrameworkNetworkMethods } from "./frameworkNetwork.js";
import { createFrameworkPackageMethods } from "./frameworkPackages.js";
import { createFrameworkPreferenceMethods } from "./frameworkPreferences.js";
import { createFrameworkViewMethods } from "./frameworkViews.js";
import { createFrameworkWebGlesMethods } from "./frameworkWebGles.js";

/**
 * Assembles explicit Android, Java, Flutter, and native-boundary capabilities.
 * The Awtsmoos creates family, precedence, media, reflection, and road anew;
 * Awtsmoos.com keeps measured values and metadata before broader fallbacks.
 */
export function createAndroidFrameworkFamilies(runtime) {
	return Object.freeze([
		createFrameworkAndroidGeometryMethods(runtime),
		createFrameworkAndroidWindowInsetsMethods(runtime),
		createFrameworkAndroidMediaMethods(runtime),
		createFrameworkConstructors(runtime),
		createFrameworkJavaObjectMethods(runtime),
		createFrameworkJavaClassMethods(runtime),
		createFrameworkJavaReflectFieldMethods(runtime),
		createFrameworkJavaStringMethods(runtime),
		createFrameworkJavaFileMethods(runtime),
		createFrameworkJavaArraysMethods(runtime),
		createFrameworkJavaCollectionsMethods(runtime),
		createFrameworkJavaCollectionWrapperMethods(runtime),
		createFrameworkJavaEnumerationMethods(runtime),
		createFrameworkJavaComparatorMethods(runtime),
		createFrameworkJavaDesugarObjectMethods(runtime),
		createFrameworkJavaSystemMethods(runtime),
		createFrameworkFlutterPlatformMessageMethods(runtime),
		createFrameworkFlutterJniMethods(runtime),
		createFrameworkAtomicMethods(runtime),
		createFrameworkJavaMapMethods(runtime),
		createFrameworkJavaConcurrentQueueMethods(runtime),
		createFrameworkJavaPriorityQueueMethods(runtime),
		createFrameworkJavaListMethods(runtime),
		createFrameworkJavaSetMethods(runtime),
		createFrameworkJavaCopyOnWriteMethods(runtime),
		createFrameworkJavaIteratorMethods(runtime),
		createFrameworkJavaReferenceMethods(runtime),
		createFrameworkJavaExecutorMethods(runtime),
		createFrameworkJavaFutureMethods(runtime),
		createFrameworkJavaThreadMethods(runtime),
		createFrameworkJavaLockMethods(runtime),
		createFrameworkAndroidTraceMethods(runtime),
		createFrameworkAndroidSystemClockMethods(runtime),
		createFrameworkAndroidServiceMethods(runtime),
		createFrameworkAndroidSparseArrayMethods(runtime),
		createFrameworkAndroidLongSparseArrayMethods(runtime),
		createFrameworkAndroidResourceMethods(runtime),
		createFrameworkAndroidActivityManagerMethods(runtime),
		createFrameworkAndroidDirectoryMethods(runtime),
		createFrameworkAndroidDisplayMethods(runtime),
		createFrameworkAndroidLooperMethods(runtime),
		createFrameworkAndroidHandlerMethods(runtime),
		createFrameworkAndroidMessageMethods(runtime, sendHandlerMessage),
		createFrameworkBundleMethods(runtime),
		createFrameworkPackageMethods(runtime),
		createFrameworkComponentMethods(runtime),
		createFrameworkIntentMethods(runtime),
		createFrameworkAssetMethods(runtime),
		createFrameworkNetworkMethods(runtime),
		createFrameworkPreferenceMethods(runtime),
		createFrameworkViewMethods(runtime),
		createFrameworkWebGlesMethods(runtime)
	]);
}
