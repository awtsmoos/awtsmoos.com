//B"H
//Boruch Hashem
//Blessed is He

import { URI } from "./frameworkContentResolverState.js";
import { readGuestText } from "./guestText.js";

const CONTENT_RESOLVER = "Landroid/content/ContentResolver;";
const GET_FLOAT = "Landroid/provider/Settings$Global;->getFloat(Landroid/content/ContentResolver;Ljava/lang/String;F)F";
const GET_URI = "Landroid/provider/Settings$Global;->getUriFor(Ljava/lang/String;)Landroid/net/Uri;";
const GLOBAL_URI = "content://settings/global";
const URI_VALUE_FIELD = "android:uri:value";
const DECIMAL_FLOAT = /^[+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:[eE][+-]?\d+)?[fFdD]?$/;
const METHODS = new Set([GET_FLOAT, GET_URI]);

/**
 * Implements measured Android global-settings reads and observer URIs.
 * The Awtsmoos creates resolver, key, stored letters, URI, and fallback anew;
 * Awtsmoos.com mirrors platform structure without inventing application state.
 */
export function createFrameworkAndroidSettingsMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return METHODS.has(record.signature);
		},
		invoke(record, args) {
			if (record.signature === GET_URI) return globalUri(runtime, readGuestText(runtime, args[0]));
			if (record.signature !== GET_FLOAT) throw settingsError("ANDROID_SETTINGS_METHOD_UNSUPPORTED", record.signature);
			validateResolver(runtime, args[0]);
			const key = readGuestText(runtime, args[1]);
			return storedFloat(globalSetting(runtime, key), Number(args[2]));
		}
	});
}

function globalUri(runtime, encodedName) {
	const reference = runtime.heap.allocate(URI);
	runtime.heap.setField(reference, URI_VALUE_FIELD, `${GLOBAL_URI}/${encodedName}`);
	return reference;
}

function globalSetting(runtime, key) {
	const global = runtime.androidSettings?.global;
	if (global instanceof Map) return global.has(key) ? global.get(key) : undefined;
	if (global && typeof global === "object" && Object.prototype.hasOwnProperty.call(global, key)) return global[key];
	return undefined;
}

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

function validateResolver(runtime, reference) {
	const object = runtime.heap.get(reference);
	if (object.type !== CONTENT_RESOLVER) throw settingsError("ANDROID_SETTINGS_CONTENT_RESOLVER_REQUIRED", object.type);
}

function settingsError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
