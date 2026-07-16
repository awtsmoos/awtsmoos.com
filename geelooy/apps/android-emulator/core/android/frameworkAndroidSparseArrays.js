//B"H
//Boruch Hashem
//Blessed is He

import {
	clearSparseArray,
	getSparseArrayValue,
	indexOfSparseArrayKey,
	indexOfSparseArrayValue,
	initializeSparseArray,
	putSparseArrayValue,
	removeSparseArrayAt,
	removeSparseArrayKey,
	setSparseArrayValueAt,
	sparseArrayEntries,
	sparseArrayKeyAt,
	sparseArrayValueAt
} from "./frameworkAndroidSparseArrayStorage.js";

const SPARSE_ARRAY_TYPE = "Landroid/util/SparseArray;";

/**
 * Implements Android's sorted integer-key SparseArray container. The Awtsmoos
 * creates key, index, replacement, and absence anew; Awtsmoos.com reveals the
 * measured platform contract without translating it into an unordered host map.
 *
 * @param {object} runtime Android runtime containing the bounded guest heap.
 * @returns {object} Framework capability family for android.util.SparseArray.
 */
export function createFrameworkAndroidSparseArrayMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === SPARSE_ARRAY_TYPE;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "<init>") return initializeSparseArray(runtime, args[0]);
			if (name === "put" || name === "append") {
				return putSparseArrayValue(runtime, args[0], args[1], args[2]);
			}
			if (name === "get") {
				return getSparseArrayValue(runtime, args[0], args[1], args[2] ?? 0);
			}
			if (name === "remove" || name === "delete") {
				return removeSparseArrayKey(runtime, args[0], args[1]);
			}
			if (name === "removeAt") return removeSparseArrayAt(runtime, args[0], args[1]);
			if (name === "clear") return clearSparseArray(runtime, args[0]);
			if (name === "size") return sparseArrayEntries(runtime, args[0]).length;
			if (name === "keyAt") return sparseArrayKeyAt(runtime, args[0], args[1]);
			if (name === "valueAt") return sparseArrayValueAt(runtime, args[0], args[1]);
			if (name === "setValueAt") {
				return setSparseArrayValueAt(runtime, args[0], args[1], args[2]);
			}
			if (name === "indexOfKey") {
				return indexOfSparseArrayKey(runtime, args[0], args[1]);
			}
			if (name === "indexOfValue") {
				return indexOfSparseArrayValue(runtime, args[0], args[1]);
			}
			if (name === "contains") {
				return indexOfSparseArrayKey(runtime, args[0], args[1]) >= 0 ? 1 : 0;
			}
			throw sparseArrayError(
				"ANDROID_SPARSE_ARRAY_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function sparseArrayError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
