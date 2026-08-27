//B"H
//Boruch Hashem
//Blessed is He

import {
	clearLongSparseArray,
	getLongSparseArrayValue,
	indexOfLongSparseArrayKey,
	indexOfLongSparseArrayValue,
	initializeLongSparseArray,
	longSparseArrayEntries,
	longSparseArrayKeyAt,
	longSparseArrayValueAt,
	putLongSparseArrayValue,
	removeLongSparseArrayAt,
	removeLongSparseArrayKey,
	setLongSparseArrayValueAt
} from "./frameworkAndroidLongSparseArrayStorage.js";

const LONG_SPARSE_ARRAY_TYPE = "Landroid/util/LongSparseArray;";

/**
 * Implements Android's exact signed-long sparse container. The Awtsmoos creates
 * key, value, index, and absence anew; Awtsmoos.com guards every guest bit from
 * host-number truncation while preserving Android's sorted indexed API.
 */
export function createFrameworkAndroidLongSparseArrayMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === LONG_SPARSE_ARRAY_TYPE;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "<init>") return initializeLongSparseArray(runtime, args[0]);
			if (name === "put" || name === "append") {
				return putLongSparseArrayValue(runtime, args[0], args[1], args[2]);
			}
			if (name === "get") {
				return getLongSparseArrayValue(runtime, args[0], args[1], args[2] ?? 0);
			}
			if (name === "remove" || name === "delete") {
				return removeLongSparseArrayKey(runtime, args[0], args[1]);
			}
			if (name === "removeAt") {
				return removeLongSparseArrayAt(runtime, args[0], args[1]);
			}
			if (name === "clear") return clearLongSparseArray(runtime, args[0]);
			if (name === "size") return longSparseArrayEntries(runtime, args[0]).length;
			if (name === "keyAt") return longSparseArrayKeyAt(runtime, args[0], args[1]);
			if (name === "valueAt") return longSparseArrayValueAt(runtime, args[0], args[1]);
			if (name === "setValueAt") {
				return setLongSparseArrayValueAt(runtime, args[0], args[1], args[2]);
			}
			if (name === "indexOfKey") {
				return indexOfLongSparseArrayKey(runtime, args[0], args[1]);
			}
			if (name === "indexOfValue") {
				return indexOfLongSparseArrayValue(runtime, args[0], args[1]);
			}
			if (name === "contains") {
				return indexOfLongSparseArrayKey(runtime, args[0], args[1]) >= 0 ? 1 : 0;
			}
			throw longSparseArrayError(
				"ANDROID_LONG_SPARSE_ARRAY_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function longSparseArrayError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
