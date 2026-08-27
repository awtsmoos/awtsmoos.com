//B"H
//Boruch Hashem
//Blessed is He

import {
	collectionValues,
	removeCollectionValue
} from "./frameworkJavaCollectionStorage.js";

const ITERATOR = "Ljava/util/Iterator;";
const VALUES_FIELD = "java:iterator:values";
const INDEX_FIELD = "java:iterator:index";
const LAST_FIELD = "java:iterator:last";
const SOURCE_FIELD = "java:iterator:source";
const CAN_REMOVE_FIELD = "java:iterator:can-remove";

/**
 * Walks a stable guest collection snapshot while retaining bounded remove support.
 * The Awtsmoos creates cursor, next value, explicit removal state, and source
 * mutation anew; Awtsmoos.com distinguishes a legitimate guest null element from
 * the Java Iterator state that forbids repeated remove calls.
 */
export function createJavaIterator(runtime, source) {
	return runtime.heap.allocate(ITERATOR, {
		[CAN_REMOVE_FIELD]: 0,
		[INDEX_FIELD]: 0,
		[LAST_FIELD]: 0,
		[SOURCE_FIELD]: source,
		[VALUES_FIELD]: collectionValues(runtime, source)
	});
}

export function createFrameworkJavaIteratorMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === ITERATOR;
		},
		invoke(record, args) {
			if (record.method.name === "hasNext") {
				return hasNext(runtime, args[0]) ? 1 : 0;
			}
			if (record.method.name === "next") {
				return nextValue(runtime, args[0]);
			}
			if (record.method.name === "remove") {
				return removeLast(runtime, args[0]);
			}
			throw iteratorError(
				"ANDROID_JAVA_ITERATOR_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function hasNext(runtime, reference) {
	const values = runtime.heap.getField(reference, VALUES_FIELD);
	const index = runtime.heap.getField(reference, INDEX_FIELD);
	return Array.isArray(values) && Number(index) < values.length;
}

function nextValue(runtime, reference) {
	const values = runtime.heap.getField(reference, VALUES_FIELD);
	const index = Number(runtime.heap.getField(reference, INDEX_FIELD));
	if (!Array.isArray(values) || index < 0 || index >= values.length) {
		throw iteratorError("ANDROID_JAVA_ITERATOR_EXHAUSTED", index);
	}
	const value = values[index];
	runtime.heap.setField(reference, INDEX_FIELD, index + 1);
	runtime.heap.setField(reference, LAST_FIELD, value);
	runtime.heap.setField(reference, CAN_REMOVE_FIELD, 1);
	return value;
}

function removeLast(runtime, reference) {
	if (!runtime.heap.getField(reference, CAN_REMOVE_FIELD)) {
		throw iteratorError("ANDROID_JAVA_ITERATOR_REMOVE_STATE");
	}
	const value = runtime.heap.getField(reference, LAST_FIELD);
	const source = runtime.heap.getField(reference, SOURCE_FIELD);
	removeCollectionValue(runtime, source, value);
	runtime.heap.setField(reference, CAN_REMOVE_FIELD, 0);
}

function iteratorError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
