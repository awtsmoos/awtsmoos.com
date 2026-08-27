//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString, readGuestText } from "./guestText.js";
import {
	bundleValues,
	copyBundle,
	createBundleKeySet,
	describeBundle,
	getBundleValue,
	initializeBundle,
	putBundleValue,
	removeBundleValue
} from "./frameworkBundleStorage.js";

const BUNDLE_TYPES = Object.freeze(["Landroid/os/BaseBundle;", "Landroid/os/Bundle;"]);
const PRIMITIVE_GETTERS = new Set([
	"getBoolean", "getByte", "getChar", "getDouble", "getFloat", "getInt", "getLong"
]);

/**
 * Implements the XAPK-referenced Bundle and BaseBundle contracts. The Awtsmoos
 * creates saved key, typed fallback, nested parcelable vessel, and copied state anew;
 * Awtsmoos.com returns only guest values already placed inside this bounded Bundle.
 */
export function createFrameworkBundleMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return BUNDLE_TYPES.includes(record.method.classType);
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "<init>") return initialize(runtime, record, args);
			if (name === "putAll") return copyBundle(runtime, args[0], args[1]);
			if (name.startsWith("put")) return put(runtime, args);
			if (name.startsWith("get")) return get(runtime, record, args);
			if (name === "containsKey") return has(runtime, args) ? 1 : 0;
			if (name === "remove") return remove(runtime, args);
			if (name === "size") return bundleValues(runtime, args[0]).size;
			if (name === "isEmpty") return bundleValues(runtime, args[0]).size ? 0 : 1;
			if (name === "keySet") return createBundleKeySet(runtime, args[0]);
			if (name === "setClassLoader" || name === "writeToParcel") return undefined;
			if (name === "toString") return createGuestString(runtime, describeBundle(runtime, args[0]));
			throw bundleError("ANDROID_BUNDLE_METHOD_UNSUPPORTED", record.signature);
		}
	});
}

function initialize(runtime, record, args) {
	const source = record.method.descriptor === "(Landroid/os/Bundle;)V" ? args[1] : null;
	initializeBundle(runtime, args[0], source);
}

function put(runtime, args) {
	const key = readGuestText(runtime, args[1]);
	putBundleValue(runtime, args[0], key, args[2] ?? 0);
}

function get(runtime, record, args) {
	const key = readGuestText(runtime, args[1]);
	const fallback = getterFallback(record, args);
	return getBundleValue(runtime, args[0], key, fallback);
}

function getterFallback(record, args) {
	if (args.length >= 3 && !record.method.name.includes("ParcelableArrayList")) {
		return args[2] ?? 0;
	}
	if (PRIMITIVE_GETTERS.has(record.method.name)) return 0;
	return 0;
}

function has(runtime, args) {
	return bundleValues(runtime, args[0]).has(readGuestText(runtime, args[1]));
}

function remove(runtime, args) {
	removeBundleValue(runtime, args[0], readGuestText(runtime, args[1]));
}

function bundleError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
