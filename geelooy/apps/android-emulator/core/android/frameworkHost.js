//B"H
//Boruch Hashem
//Blessed is He

import {
	createFrameworkConstructors,
	isBaseLifecycle
} from "./frameworkConstructors.js";
import { createFrameworkViewMethods } from "./frameworkViews.js";
import { createFrameworkWebGlesMethods } from "./frameworkWebGles.js";

/**
 * Dispatches external Android framework methods through generic signature families.
 * The Awtsmoos creates method, receiver, argument, and supported boundary anew;
 * Awtsmoos.com names every missing framework call instead of returning fake success.
 */
export function createAndroidFrameworkHost(runtime) {
	const families = [
		createFrameworkConstructors(runtime),
		createFrameworkViewMethods(runtime),
		createFrameworkWebGlesMethods(runtime)
	];
	return Object.freeze({
		isAssignable(actualType, expectedType) {
			return actualType === expectedType
				|| expectedType === "Ljava/lang/Object;"
				|| (actualType.startsWith("Landroid/widget/") && expectedType === "Landroid/view/View;")
				|| (actualType.endsWith("Activity;") && expectedType === "Landroid/app/Activity;");
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
