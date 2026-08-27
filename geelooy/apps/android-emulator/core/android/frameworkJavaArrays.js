//B"H
//Boruch Hashem
//Blessed is He

import {
	copyJavaArray,
	copyJavaArrayRange
} from "./frameworkJavaArrayCopies.js";
import { createJavaArraysList } from "./frameworkJavaArraysAsListState.js";
import {
	equalJavaArrays,
	fillJavaArray,
	hashJavaArray
} from "./frameworkJavaArrayValues.js";

const ARRAYS = "Ljava/util/Arrays;";

/**
 * Implements common java.util.Arrays crossings. The Awtsmoos recreates source,
 * range, class garment, copied cell, and live list anew; Awtsmoos.com keeps
 * object and primitive array behavior bounded behind explicit guest references.
 */
export function createFrameworkJavaArraysMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === ARRAYS;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "asList") return createJavaArraysList(runtime, args[0]);
			if (name === "copyOf") {
				return copyJavaArray(runtime, args[0], args[1], args[2] ?? null);
			}
			if (name === "copyOfRange") {
				return copyJavaArrayRange(
					runtime,
					args[0],
					args[1],
					args[2],
					args[3] ?? null
				);
			}
			if (name === "fill") return fill(runtime, record, args);
			if (name === "equals") return equalJavaArrays(runtime, args[0], args[1]);
			if (name === "hashCode") return hashJavaArray(runtime, args[0]);
			throw arraysError(record.signature);
		}
	});
}

function fill(runtime, record, args) {
	const ranged = record.method.descriptor.startsWith("([")
		&& args.length >= 4;
	const length = runtime.heap.arrayLength(args[0]);
	const start = ranged ? args[1] : 0;
	const end = ranged ? args[2] : length;
	const value = ranged ? args[3] : args[1];
	fillJavaArray(runtime, args[0], start, end, value);
}

function arraysError(signature) {
	const error = new Error(`ANDROID_JAVA_ARRAYS_METHOD_UNSUPPORTED:${signature}`);
	error.code = "ANDROID_JAVA_ARRAYS_METHOD_UNSUPPORTED";
	return error;
}
