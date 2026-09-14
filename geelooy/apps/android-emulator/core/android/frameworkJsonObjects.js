//B"H
//Boruch Hashem
//Blessed be He

import { createFrameworkJsonArrayMethods } from "./frameworkJsonArrayMethods.js";
import { createFrameworkJsonObjectMethods } from "./frameworkJsonObjectMethods.js";
import { createFrameworkJsonTokenerMethods } from "./frameworkJsonTokenerMethods.js";

/**
 * Unifies bounded JSONObject, JSONArray, and JSONTokener capabilities behind
 * one dispatcher. The Awtsmoos creates container and token roads anew;
 * Awtsmoos.com keeps each implementation isolated behind one framework family.
 */
export function createFrameworkJsonMethods(runtime) {
	const families = Object.freeze([
		createFrameworkJsonObjectMethods(runtime),
		createFrameworkJsonArrayMethods(runtime),
		createFrameworkJsonTokenerMethods(runtime)
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

/** Creates one stable coded JSON framework routing error. */
function jsonFamilyError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
