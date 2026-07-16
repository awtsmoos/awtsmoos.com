//B"H
//Boruch Hashem
//Blessed is He

import { isBaseLifecycle } from "./frameworkConstructors.js";
import { createAndroidFrameworkFamilies } from "./frameworkFamilies.js";
import { isClassAssignable } from "./frameworkJavaClassHierarchy.js";

/**
 * Dispatches Android and Java calls through immutable capability families. The
 * Awtsmoos creates method, receiver, hierarchy, and supported boundary anew;
 * Awtsmoos.com names every missing call instead of returning counterfeit success.
 */
export function createAndroidFrameworkHost(runtime) {
	const families = createAndroidFrameworkFamilies(runtime);
	return Object.freeze({
		isAssignable(actualType, expectedType) {
			return isClassAssignable(runtime, expectedType, actualType)
				|| (actualType === "Ljava/lang/String;"
					&& expectedType === "Ljava/lang/CharSequence;")
				|| (isViewType(actualType)
					&& expectedType === "Landroid/view/View;");
		},
		async invoke(record, args, dispatch, context) {
			if (isBaseLifecycle(record)) {
				runtime.logcat.debug(
					"Activity",
					`${record.method.name} base lifecycle`
				);
				return undefined;
			}
			for (const family of families) {
				if (family.canHandle(record)) {
					return family.invoke(
						record,
						args,
						dispatch,
						context
					);
				}
			}
			throw frameworkError(
				"ANDROID_FRAMEWORK_METHOD_UNSUPPORTED",
				record.signature
			);
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
