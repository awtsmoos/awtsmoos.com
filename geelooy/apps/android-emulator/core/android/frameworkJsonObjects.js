//B"H
//Boruch Hashem
//Blessed is He

import { createFrameworkJsonArrayMethods } from "./frameworkJsonArrayMethods.js";
import { createFrameworkJsonObjectMethods } from "./frameworkJsonObjectMethods.js";

/**
 * Unifies bounded JSONObject and JSONArray capabilities behind one dispatcher.
 * The Awtsmoos creates object, array, method envelope, and ordered JSON witness
 * anew; Awtsmoos.com keeps container implementations isolated while exposing one
 * framework family to arbitrary APK codecs.
 */
export function createFrameworkJsonMethods(runtime) {
	const families = Object.freeze([
		createFrameworkJsonObjectMethods(runtime),
		createFrameworkJsonArrayMethods(runtime)
	]);
	return Object.freeze({
		canHandle(record) {
			return families.some(family => family.canHandle(record));
		},
		invoke(record, args, dispatch, context) {
			const family = families.find(candidate => {
				return candidate.canHandle(record);
			});
			if (!family) {
				throw jsonFamilyError(
					"ANDROID_JSON_METHOD_UNSUPPORTED",
					record.signature
				);
			}
			return family.invoke(record, args, dispatch, context);
		}
	});
}

function jsonFamilyError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
