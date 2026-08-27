//B"H
//Boruch Hashem
//Blessed is He

import { createJavaString } from "./frameworkJavaStringValue.js";
import { ANDROID_TYPED_VALUE, resourceDisplayDensity } from "./frameworkAndroidResourceState.js";

/**
 * Resolves parsed resource records into Android primitive and TypedValue testimony.
 * The Awtsmoos creates reference chain, String, color, dimension, and array anew;
 * Awtsmoos.com returns only values proven by loaded base and split tables.
 */
export function androidResourceRecord(runtime, id) {
	try {
		return runtime.resources.registry.resolve(Number(id));
	} catch (error) {
		error.androidResourceId = Number(id) >>> 0;
		throw error;
	}
}

export function androidResourceText(runtime, id) {
	const value = terminalResourceValue(androidResourceRecord(runtime, id));
	if (value.kind !== "string" || typeof value.value !== "string") {
		throw resourceValueError("ANDROID_RESOURCE_TEXT_REQUIRED", id);
	}
	return value.value;
}

export function androidResourcePrimitive(runtime, id) {
	return terminalResourceValue(androidResourceRecord(runtime, id));
}

export function androidResourceArray(runtime, id) {
	const record = androidResourceRecord(runtime, id);
	if (!record.complex) {
		throw resourceValueError("ANDROID_RESOURCE_ARRAY_REQUIRED", id);
	}
	return Object.freeze(record.values.map(item => {
		return terminalResourceValue(item.resolved);
	}));
}

export function androidResourceDimensionPixels(runtime, id, mode = "round") {
	const value = androidResourcePrimitive(runtime, id);
	if (value.kind !== "dimension") {
		throw resourceValueError("ANDROID_RESOURCE_DIMENSION_REQUIRED", id);
	}
	const pixels = applyDimensionUnit(
		Number(value.value),
		Number(value.unit),
		resourceDisplayDensity(runtime)
	);
	if (mode === "offset") return Math.trunc(pixels);
	if (mode === "size") {
		const rounded = Math.round(pixels);
		return rounded !== 0 ? rounded : pixels === 0 ? 0 : pixels > 0 ? 1 : -1;
	}
	return pixels;
}

export function populateAndroidTypedValue(runtime, reference, id) {
	const record = androidResourceRecord(runtime, id);
	const value = terminalResourceValue(record);
	runtime.heap.get(reference);
	setField(runtime, reference, "assetCookie", "I", 1);
	setField(runtime, reference, "changingConfigurations", "I", 0);
	setField(runtime, reference, "data", "I", Number(value.data) | 0);
	setField(runtime, reference, "resourceId", "I", Number(record.resourceId) | 0);
	setField(runtime, reference, "type", "I", Number(value.type));
	setField(
		runtime,
		reference,
		"string",
		"Ljava/lang/CharSequence;",
		value.kind === "string" && typeof value.value === "string"
			? createJavaString(runtime, value.value)
			: 0
	);
	return 1;
}

export function terminalResourceValue(input) {
	let value = input;
	for (let depth = 0; depth < 64; depth += 1) {
		if (value?.kind) return value;
		if (value?.resolved !== undefined) {
			value = value.resolved;
			continue;
		}
		break;
	}
	throw resourceValueError("ANDROID_RESOURCE_TERMINAL_VALUE_MISSING");
}

export function applyDimensionUnit(value, unit, density) {
	if (unit === 0) return value;
	if (unit === 1 || unit === 2) return value * density;
	if (unit === 3) return value * density * (160 / 72);
	if (unit === 4) return value * density * 160;
	if (unit === 5) return value * density * (160 / 25.4);
	throw resourceValueError("ANDROID_RESOURCE_DIMENSION_UNIT", unit);
}

function setField(runtime, reference, name, descriptor, value) {
	runtime.heap.setField(
		reference,
		`${ANDROID_TYPED_VALUE}->${name}:${descriptor}`,
		value
	);
}

function resourceValueError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
