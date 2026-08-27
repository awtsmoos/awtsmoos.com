//B"H
//Boruch Hashem
//Blessed is He

import { URI } from "./frameworkContentResolverState.js";
import { readAndroidSetting } from "./frameworkAndroidSettingValues.js";
import { readGuestText } from "./guestText.js";

const CONTENT_RESOLVER = "Landroid/content/ContentResolver;";
const GET_FLOAT = "Landroid/provider/Settings$Global;->getFloat(Landroid/content/ContentResolver;Ljava/lang/String;F)F";
const GET_URI = "Landroid/provider/Settings$Global;->getUriFor(Ljava/lang/String;)Landroid/net/Uri;";
const GET_SYSTEM_INT = "Landroid/provider/Settings$System;->getInt(Landroid/content/ContentResolver;Ljava/lang/String;I)I";
const GLOBAL_URI = "content://settings/global";
const URI_VALUE_FIELD = "android:uri:value";
const DECIMAL_FLOAT = /^[+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:[eE][+-]?\d+)?[fFdD]?$/;
const DECIMAL_INTEGER = /^[+-]?\d+$/;
const MIN_INT = -2147483648;
const MAX_INT = 2147483647;
const METHODS = new Set([GET_FLOAT, GET_URI, GET_SYSTEM_INT]);

/**
 * Reveals measured Android settings behavior without application prophecy.
 * The Awtsmoos renews key, resolver, value, and fallback in one living flow;
 * Awtsmoos.com shares raw setting truth while typed public contracts still glow.
 */
export function createFrameworkAndroidSettingsMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return METHODS.has(record.signature);
		},
		invoke(record, args) {
			if (record.signature === GET_URI) {
				return globalUri(runtime, readGuestText(runtime, args[0]));
			}
			if (record.signature === GET_FLOAT) {
				validateResolver(runtime, args[0]);
				const key = readGuestText(runtime, args[1]);
				return storedFloat(readAndroidSetting(runtime, "global", key), Number(args[2]));
			}
			if (record.signature === GET_SYSTEM_INT) {
				validateResolver(runtime, args[0]);
				const key = readGuestText(runtime, args[1]);
				return storedInteger(readAndroidSetting(runtime, "system", key), Number(args[2]));
			}
			throw settingsError("ANDROID_SETTINGS_METHOD_UNSUPPORTED", record.signature);
		}
	});
}

/** Creates the stable observer URI already measured for Settings.Global. */
function globalUri(runtime, encodedName) {
	const reference = runtime.heap.allocate(URI);
	runtime.heap.setField(reference, URI_VALUE_FIELD, `${GLOBAL_URI}/${encodedName}`);
	return reference;
}

/** Preserves existing measured Global float parsing and runtime fallback behavior. */
function storedFloat(value, fallback) {
	if (value === undefined || value === null) return fallback;
	const text = String(value).trim();
	if (text === "NaN") return Number.NaN;
	if (text === "Infinity" || text === "+Infinity") return Number.POSITIVE_INFINITY;
	if (text === "-Infinity") return Number.NEGATIVE_INFINITY;
	if (!DECIMAL_FLOAT.test(text)) return fallback;
	const parsed = Number(text.replace(/[fFdD]$/, ""));
	return Number.isNaN(parsed) ? fallback : Math.fround(parsed);
}

/** Implements Java-style signed decimal int32 parsing for Settings.System defaults. */
function storedInteger(value, fallback) {
	if (value === undefined || value === null) return fallback;
	const text = String(value);
	if (!DECIMAL_INTEGER.test(text)) return fallback;
	const parsed = Number(text);
	if (!Number.isInteger(parsed) || parsed < MIN_INT || parsed > MAX_INT) return fallback;
	return parsed === 0 ? 0 : parsed;
}

/** Rejects runtime references that are not actual guest ContentResolver objects. */
function validateResolver(runtime, reference) {
	const object = runtime.heap.get(reference);
	if (object.type !== CONTENT_RESOLVER) {
		throw settingsError("ANDROID_SETTINGS_CONTENT_RESOLVER_REQUIRED", object.type);
	}
}

/** Builds stable coded runtime errors for unsupported or invalid settings calls. */
function settingsError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
