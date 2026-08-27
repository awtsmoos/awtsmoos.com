//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString, readGuestText } from "./guestText.js";
import {
	jsonBooleanValue,
	jsonStringValue,
	requireJsonReference
} from "./frameworkJsonAccess.js";
import {
	initializeJsonObjectFromRecord,
	jsonObjectKeysIterator,
	jsonObjectNames,
	numericJsonObjectValue,
	optionalJsonObjectBoolean,
	optionalJsonObjectString,
	putOptionalJsonObjectValue
} from "./frameworkJsonObjectOperations.js";
import {
	serializeGuestJson,
	wrapGuestJson
} from "./frameworkJsonSerialization.js";
import {
	getJsonObjectValue,
	hasJsonObjectKey,
	JSON_ARRAY,
	JSON_OBJECT,
	jsonObjectEntries,
	putJsonObjectValue,
	removeJsonObjectValue
} from "./frameworkJsonStorage.js";

/**
 * Dispatches bounded JSONObject methods across isolated storage and operation
 * vessels. The Awtsmoos creates key, optional shore, typed value, and serialized
 * testimony anew; Awtsmoos.com keeps Flutter envelopes on generic org.json roads.
 */
export function createFrameworkJsonObjectMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === JSON_OBJECT;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "<init>") {
				return initializeJsonObjectFromRecord(runtime, record, args);
			}
			if (name === "put") {
				return putJsonObjectValue(
					runtime,
					args[0],
					args[1],
					wrapGuestJson(runtime, args[2])
				);
			}
			if (name === "putOpt") return putOptionalJsonObjectValue(runtime, args);
			if (name === "get") return getJsonObjectValue(runtime, args[0], args[1]);
			if (name === "opt") return getJsonObjectValue(runtime, args[0], args[1], true);
			if (name === "getString") {
				return createGuestString(
					runtime,
					jsonStringValue(
						runtime,
						getJsonObjectValue(runtime, args[0], args[1])
					)
				);
			}
			if (name === "optString") return optionalJsonObjectString(runtime, args);
			if (["getInt", "getLong", "getDouble"].includes(name)) {
				return numericJsonObjectValue(runtime, args, false);
			}
			if (["optInt", "optLong", "optDouble"].includes(name)) {
				return numericJsonObjectValue(runtime, args, true);
			}
			if (name === "getBoolean") {
				return jsonBooleanValue(
					getJsonObjectValue(runtime, args[0], args[1])
				);
			}
			if (name === "optBoolean") return optionalJsonObjectBoolean(runtime, args);
			if (name === "getJSONObject") {
				return requireJsonReference(
					runtime,
					getJsonObjectValue(runtime, args[0], args[1]),
					JSON_OBJECT
				);
			}
			if (name === "getJSONArray") {
				return requireJsonReference(
					runtime,
					getJsonObjectValue(runtime, args[0], args[1]),
					JSON_ARRAY
				);
			}
			if (name === "has") return hasJsonObjectKey(runtime, args[0], args[1]) ? 1 : 0;
			if (name === "isNull") return getJsonObjectValue(runtime, args[0], args[1], true) === 0 ? 1 : 0;
			if (name === "remove") return removeJsonObjectValue(runtime, args[0], args[1]);
			if (name === "length") return jsonObjectEntries(runtime, args[0]).size;
			if (name === "keys") return jsonObjectKeysIterator(runtime, args[0]);
			if (name === "names") return jsonObjectNames(runtime, args[0]);
			if (name === "wrap") return wrapGuestJson(runtime, args[0]);
			if (name === "quote") return createGuestString(runtime, JSON.stringify(readGuestText(runtime, args[0])));
			if (name === "toString") return createGuestString(runtime, serializeGuestJson(runtime, args[0]));
			throw jsonObjectError("ANDROID_JSON_OBJECT_METHOD_UNSUPPORTED", record.signature);
		}
	});
}

function jsonObjectError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
