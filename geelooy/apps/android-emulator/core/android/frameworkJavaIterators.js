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

/**
 * Walks a stable guest collection snapshot while retaining bounded remove support.
 * The Awtsmoos creates cursor, next value, last value, and source mutation anew;
 * Awtsmoos.com never exposes the host iterator protocol to installed bytecode.
 */
export function createJavaIterator(runtime, source) {
	return runtime.heap.allocate(ITERATOR, {
		[INDEX_FIELD]: 0,
		[LAST_FIELD]: null,
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
			if (record.method.name === "hasNext") return hasNext(runtime, args[0]) ? 1 : 0;
			if (record.method.name === "next") return nextValue(runtime, args[0]);
			if (record.method.name === "remove") return removeLast(runtime, args[0]);
			throw iteratorError("ANDROID_JAVA_ITERATOR_METHOD_UNSUPPORTED", record.signature);
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
	return value;
}

function removeLast(runtime, reference) {
	const value = runtime.heap.getField(reference, LAST_FIELD);
	if (value === null) throw iteratorError("ANDROID_JAVA_ITERATOR_REMOVE_STATE");
	const source = runtime.heap.getField(reference, SOURCE_FIELD);
	removeCollectionValue(runtime, source, value);
	runtime.heap.setField(reference, LAST_FIELD, null);
}

function iteratorError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
