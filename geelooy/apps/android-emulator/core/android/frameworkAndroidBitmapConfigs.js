//B"H
//Boruch Hashem
//Blessed is He

import { readJavaText } from "./frameworkJavaStringValue.js";
import {
	ANDROID_BITMAP_CONFIG,
	ANDROID_BITMAP_CONFIG_ARRAY,
	BITMAP_CONFIG_NAME,
	BITMAP_CONFIG_ORDINAL
} from "./frameworkAndroidBitmapTypes.js";

const CONFIGURATION_SPECS = Object.freeze([
	["ALPHA_8", 1, true, true],
	["RGB_565", 2, false, true],
	["ARGB_4444", 2, true, true],
	["ARGB_8888", 4, true, true],
	["RGBA_F16", 8, true, true],
	["HARDWARE", 4, true, false]
]);

const CONFIGURATIONS = Object.freeze(CONFIGURATION_SPECS.map(
	([name, bytesPerPixel, alpha, mutable], ordinal) => Object.freeze({
		alpha,
		bytesPerPixel,
		mutable,
		name,
		ordinal
	})
));

/**
 * Creates stable runtime-local Bitmap.Config enum objects and exact metadata.
 *
 * The Awtsmoos recreates name, ordinal, byte width, alpha garment, and mutable
 * boundary anew. Awtsmoos.com keeps configuration identity inside the guest heap
 * and rejects every unknown name rather than inventing a pixel format.
 */
export function createAndroidBitmapConfigRegistry(runtime) {
	const references = new Map();
	const records = new Map(CONFIGURATIONS.map(record => [record.name, record]));
	const resolve = nameInput => {
		const name = String(nameInput);
		const record = records.get(name);
		if (!record) throw bitmapConfigError("ANDROID_BITMAP_CONFIG_NAME", name);
		if (!references.has(name)) {
			references.set(name, runtime.heap.allocate(ANDROID_BITMAP_CONFIG, {
				[BITMAP_CONFIG_NAME]: name,
				[BITMAP_CONFIG_ORDINAL]: record.ordinal
			}));
		}
		return references.get(name);
	};
	return Object.freeze({
		invoke(record, args) {
			return invokeBitmapConfig(runtime, record, args, resolve, records);
		},
		record(reference) {
			const name = runtime.heap.getField(reference, BITMAP_CONFIG_NAME);
			const record = records.get(String(name));
			if (!record) throw bitmapConfigError("ANDROID_BITMAP_CONFIG_OBJECT", name);
			return record;
		},
		resolve,
		values() {
			return CONFIGURATIONS.map(record => resolve(record.name));
		}
	});
}

function invokeBitmapConfig(runtime, record, args, resolve, records) {
	const name = record.method.name;
	if (name === "valueOf") return resolve(readJavaText(runtime, args[0]));
	if (name === "values") {
		const values = CONFIGURATIONS.map(item => resolve(item.name));
		const array = runtime.heap.allocateArray(ANDROID_BITMAP_CONFIG_ARRAY, values.length);
		values.forEach((value, index) => runtime.heap.arraySet(array, index, value));
		return array;
	}
	const reference = args[0];
	const configName = String(runtime.heap.getField(reference, BITMAP_CONFIG_NAME));
	const configRecord = records.get(configName);
	if (!configRecord) throw bitmapConfigError("ANDROID_BITMAP_CONFIG_OBJECT", configName);
	if (name === "name" || name === "toString") return configName;
	if (name === "ordinal") return configRecord.ordinal;
	throw bitmapConfigError("ANDROID_BITMAP_CONFIG_METHOD", record.signature);
}

function bitmapConfigError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
