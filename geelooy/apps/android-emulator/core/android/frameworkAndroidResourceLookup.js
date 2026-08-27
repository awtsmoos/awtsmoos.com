//B"H
//Boruch Hashem
//Blessed is He

import {
	androidResourceArray,
	androidResourceDimensionPixels,
	androidResourcePrimitive,
	populateAndroidTypedValue
} from "./frameworkAndroidResourceValues.js";
import { formattedAndroidResourceText } from "./frameworkAndroidResourceText.js";
import { createGuestArray, createJavaString, readJavaText } from "./frameworkJavaStringValue.js";
const LOOKUP_NAMES = new Set([
	"getBoolean", "getColor", "getColorStateList", "getDimensionPixelOffset",
	"getDimensionPixelSize", "getDrawable", "getFloat", "getIdentifier",
	"getQuantityString", "getQuantityText", "getResourceEntryName",
	"getResourceName", "getResourcePackageName", "getResourceTypeName",
	"getString", "getStringArray", "getText", "getTextArray", "getValue"
]);

/**
 * Resolves Resources and Context lookup methods from merged package tables. The
 * Awtsmoos creates ID, translated text, dimension, color, and qualified name anew;
 * Awtsmoos.com returns only values present in validated APK artifacts.
 */
export function invokeAndroidResourceLookup(runtime, record, args) {
	const name = record.method.name;
	if (name === "getIdentifier") return resourceIdentifier(runtime, args);
	const id = Number(args[1]);
	if (name.startsWith("getResource")) return resourceName(runtime, name, id);
	if ([
		"getString", "getText", "getQuantityString", "getQuantityText"
	].includes(name)) {
		return createJavaString(
			runtime,
			formattedAndroidResourceText(runtime, name, id, args)
		);
	}
	if (["getStringArray", "getTextArray"].includes(name)) {
		return resourceTextArray(runtime, id);
	}
	if (name === "getBoolean") {
		return androidResourcePrimitive(runtime, id).value ? 1 : 0;
	}
	if (name === "getColor") {
		return Number(androidResourcePrimitive(runtime, id).data) | 0;
	}
	if (name === "getFloat") {
		return Number(androidResourcePrimitive(runtime, id).value);
	}
	if (name === "getDimensionPixelOffset") {
		return androidResourceDimensionPixels(runtime, id, "offset");
	}
	if (name === "getDimensionPixelSize") {
		return androidResourceDimensionPixels(runtime, id, "size");
	}
	if (name === "getValue") {
		return populateAndroidTypedValue(runtime, args[2], id);
	}
	if (["getDrawable", "getColorStateList"].includes(name)) {
		return createResourceObject(runtime, name, id);
	}
	throw lookupError(
		"ANDROID_RESOURCE_LOOKUP_METHOD_UNSUPPORTED",
		record.signature
	);
}

export function isAndroidResourceLookup(name) {
	return LOOKUP_NAMES.has(name);
}

function resourceIdentifier(runtime, args) {
	return runtime.resources.registry.identifier(
		readJavaText(runtime, args[1]),
		readJavaText(runtime, args[2]),
		readJavaText(runtime, args[3])
	);
}

function resourceTextArray(runtime, id) {
	const values = androidResourceArray(runtime, id).map(value => {
		return createJavaString(runtime, String(value.value ?? ""));
	});
	return createGuestArray(runtime, "[Ljava/lang/String;", values);
}

function createResourceObject(runtime, name, id) {
	const type = name === "getDrawable"
		? "Landroid/graphics/drawable/Drawable;"
		: "Landroid/content/res/ColorStateList;";
	return runtime.heap.allocate(type, { "android:resource:id": id });
}

function resourceName(runtime, name, id) {
	const qualified = runtime.resources.registry.name(id);
	if (!qualified) throw lookupError("ANDROID_RESOURCE_NAME_MISSING", id);
	const [packageName, remainder] = qualified.split(":");
	const [typeName, entryName] = remainder.split("/");
	const value = name === "getResourceEntryName" ? entryName
		: name === "getResourcePackageName" ? packageName
			: name === "getResourceTypeName" ? typeName : qualified;
	return createJavaString(runtime, value);
}

function lookupError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
