//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkAndroidHandlerMethods } from "./frameworkAndroidHandlers.js";
import { sendHandlerMessage } from "./frameworkAndroidHandlerQueue.js";
import { createFrameworkAndroidLooperMethods } from "./frameworkAndroidLoopers.js";
import { createFrameworkAndroidMessageMethods } from "./frameworkAndroidMessages.js";
import { createFrameworkAssetMethods } from "./frameworkAssets.js";
import { createFrameworkAtomicReferenceMethods } from "./frameworkAtomicReference.js";
import { createFrameworkBundleMethods } from "./frameworkBundles.js";
import { createFrameworkComponentMethods } from "./frameworkComponents.js";
import { createFrameworkConstructors, isBaseLifecycle } from "./frameworkConstructors.js";
import { createFrameworkIntentMethods } from "./frameworkIntents.js";
import { createFrameworkJavaClassMethods } from "./frameworkJavaClasses.js";
import { isClassAssignable } from "./frameworkJavaClassHierarchy.js";
import { createFrameworkJavaCopyOnWriteMethods } from "./frameworkJavaCopyOnWrite.js";
import { createFrameworkJavaExecutorMethods } from "./frameworkJavaExecutors.js";
import { createFrameworkJavaFutureMethods } from "./frameworkJavaFutures.js";
import { createFrameworkJavaIteratorMethods } from "./frameworkJavaIterators.js";
import { createFrameworkJavaListMethods } from "./frameworkJavaLists.js";
import { createFrameworkJavaLockMethods } from "./frameworkJavaLocks.js";
import { createFrameworkJavaMapMethods } from "./frameworkJavaMaps.js";
import { createFrameworkJavaObjectMethods } from "./frameworkJavaObjects.js";
import { createFrameworkJavaReferenceMethods } from "./frameworkJavaReferences.js";
import { createFrameworkJavaSetMethods } from "./frameworkJavaSets.js";
import { createFrameworkJavaThreadMethods } from "./frameworkJavaThreads.js";
import { createFrameworkNetworkMethods } from "./frameworkNetwork.js";
import { createFrameworkPackageMethods } from "./frameworkPackages.js";
import { createFrameworkPreferenceMethods } from "./frameworkPreferences.js";
import { createFrameworkViewMethods } from "./frameworkViews.js";
import { createFrameworkWebGlesMethods } from "./frameworkWebGles.js";

/**
 * Dispatches Android and Java framework calls through generic signature families.
 * The Awtsmoos creates method, receiver, hierarchy, and supported boundary anew;
 * Awtsmoos.com names every missing call instead of returning counterfeit success.
 */
export function createAndroidFrameworkHost(runtime) {
	const families = [
		createFrameworkConstructors(runtime),
		createFrameworkJavaObjectMethods(runtime),
		createFrameworkJavaClassMethods(runtime),
		createFrameworkAtomicReferenceMethods(runtime),
		createFrameworkJavaMapMethods(runtime),
		createFrameworkJavaListMethods(runtime),
		createFrameworkJavaSetMethods(runtime),
		createFrameworkJavaCopyOnWriteMethods(runtime),
		createFrameworkJavaIteratorMethods(runtime),
		createFrameworkJavaReferenceMethods(runtime),
		createFrameworkJavaExecutorMethods(runtime),
		createFrameworkJavaFutureMethods(runtime),
		createFrameworkJavaThreadMethods(runtime),
		createFrameworkJavaLockMethods(runtime),
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
	];
	return Object.freeze({
		isAssignable(actualType, expectedType) {
			return isClassAssignable(runtime, expectedType, actualType)
				|| (actualType === "Ljava/lang/String;"
					&& expectedType === "Ljava/lang/CharSequence;")
				|| (isViewType(actualType) && expectedType === "Landroid/view/View;");
		},
		async invoke(record, args, dispatch, context) {
			if (isBaseLifecycle(record)) {
				runtime.logcat.debug("Activity", `${record.method.name} base lifecycle`);
				return undefined;
			}
			for (const family of families) {
				if (family.canHandle(record)) {
					return family.invoke(record, args, dispatch, context);
				}
			}
			throw frameworkError("ANDROID_FRAMEWORK_METHOD_UNSUPPORTED", record.signature);
		},
		snapshot() {
			return Object.freeze({
				contentView: runtime.views.snapshot(runtime.contentView),
				graphics: runtime.graphics.snapshot(),
				logs: runtime.logcat.snapshot()
			});
		}
	});
}

function isViewType(type) {
	return type.startsWith("Landroid/widget/")
		|| type.startsWith("Landroid/webkit/")
		|| type === "Landroid/view/View;";
}

function frameworkError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.signature = detail;
	return error;
}
