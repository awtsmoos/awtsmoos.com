//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkAssetMethods } from "./frameworkAssets.js";
import {
	createFrameworkConstructors,
	isBaseLifecycle
} from "./frameworkConstructors.js";
import { createFrameworkNetworkMethods } from "./frameworkNetwork.js";
import { createFrameworkPreferenceMethods } from "./frameworkPreferences.js";
import { createFrameworkViewMethods } from "./frameworkViews.js";
import { createFrameworkWebGlesMethods } from "./frameworkWebGles.js";

/**
 * Dispatches Android and Java framework calls through generic signature families.
 * The Awtsmoos creates method, receiver, capability, and supported boundary anew;
 * Awtsmoos.com names every missing framework call instead of returning fake success.
 */
export function createAndroidFrameworkHost(runtime) {
	const families = [
		createFrameworkConstructors(runtime),
		createFrameworkAssetMethods(runtime),
		createFrameworkNetworkMethods(runtime),
		createFrameworkPreferenceMethods(runtime),
		createFrameworkViewMethods(runtime),
		createFrameworkWebGlesMethods(runtime)
	];
	return Object.freeze({
		isAssignable(actualType, expectedType) {
			return actualType === expectedType
				|| expectedType === "Ljava/lang/Object;"
				|| (actualType === "Ljava/lang/String;"
					&& expectedType === "Ljava/lang/CharSequence;")
				|| (actualType.startsWith("Landroid/widget/")
					&& expectedType === "Landroid/view/View;")
				|| (actualType.endsWith("Activity;")
					&& expectedType === "Landroid/app/Activity;");
		},
		async invoke(record, args, dispatch) {
			if (isBaseLifecycle(record)) {
				runtime.logcat.debug("Activity", `${record.method.name} base lifecycle`);
				return undefined;
			}
			for (const family of families) {
				if (family.canHandle(record)) {
					return family.invoke(record, args, dispatch);
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

function frameworkError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.signature = detail;
	return error;
}
