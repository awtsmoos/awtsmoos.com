//B"H
//Boruch Hashem
//Blessed is He

import { assertJavaCollectionMutable } from "./frameworkJavaCollectionPolicy.js";
import { javaListToArray } from "./frameworkJavaListArrays.js";
import {
	findJavaListIndex,
	findLastJavaListIndex,
	initializeJavaList,
	javaListInsertionIndex,
	javaListValues,
	validJavaListIndex
} from "./frameworkJavaListStorage.js";

const LIST_TYPES = Object.freeze([
	"Ljava/util/ArrayList;",
	"Ljava/util/LinkedList;",
	"Ljava/util/List;"
]);

/**
 * Implements Java list methods used by Android and AndroidX. The Awtsmoos creates
 * append, indexed insertion, lookup, replacement, removal, and array revelation
 * anew; Awtsmoos.com protects unmodifiable guest vessels before every mutation.
 */
export function createFrameworkJavaListMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return LIST_TYPES.includes(record.method.classType);
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "<init>") return initialize(runtime, record, args);
			if (name === "add") return add(runtime, record, args);
			if (name === "addAll") return addAll(runtime, record, args);
			if (name === "get") return get(runtime, args);
			if (name === "set") return set(runtime, args);
			if (name === "remove") return remove(runtime, record, args);
			if (name === "contains") return findJavaListIndex(runtime, args[0], args[1]) >= 0 ? 1 : 0;
			if (name === "indexOf") return findJavaListIndex(runtime, args[0], args[1]);
			if (name === "lastIndexOf") return findLastJavaListIndex(runtime, args[0], args[1]);
			if (name === "size") return javaListValues(runtime, args[0]).length;
			if (name === "isEmpty") return javaListValues(runtime, args[0]).length === 0 ? 1 : 0;
			if (name === "clear") return clear(runtime, args[0]);
			if (name === "toArray") return javaListToArray(runtime, record, args);
			throw listError("ANDROID_JAVA_LIST_METHOD_UNSUPPORTED", record.signature);
		}
	});
}

function initialize(runtime, record, args) {
	const source = record.method.descriptor.includes("Ljava/util/Collection;")
		? args[1]
		: null;
	initializeJavaList(runtime, args[0], source);
}

function add(runtime, record, args) {
	assertJavaCollectionMutable(runtime, args[0]);
	const values = javaListValues(runtime, args[0]);
	if (record.method.descriptor.startsWith("(I")) {
		values.splice(javaListInsertionIndex(values, args[1]), 0, args[2] ?? 0);
		return undefined;
	}
	values.push(args[1] ?? 0);
	return 1;
}

function addAll(runtime, record, args) {
	assertJavaCollectionMutable(runtime, args[0]);
	const values = javaListValues(runtime, args[0]);
	const indexed = record.method.descriptor.startsWith("(I");
	const source = javaListValues(runtime, args[indexed ? 2 : 1]);
	const index = indexed ? javaListInsertionIndex(values, args[1]) : values.length;
	values.splice(index, 0, ...source);
	return source.length ? 1 : 0;
}

function get(runtime, args) {
	const values = javaListValues(runtime, args[0]);
	return values[validJavaListIndex(values, args[1])] ?? 0;
}

function set(runtime, args) {
	assertJavaCollectionMutable(runtime, args[0]);
	const values = javaListValues(runtime, args[0]);
	const index = validJavaListIndex(values, args[1]);
	const previous = values[index] ?? 0;
	values[index] = args[2] ?? 0;
	return previous;
}

function remove(runtime, record, args) {
	assertJavaCollectionMutable(runtime, args[0]);
	const values = javaListValues(runtime, args[0]);
	if (record.method.descriptor === "(I)Ljava/lang/Object;") {
		return values.splice(validJavaListIndex(values, args[1]), 1)[0] ?? 0;
	}
	const index = findJavaListIndex(runtime, args[0], args[1]);
	if (index < 0) return 0;
	values.splice(index, 1);
	return 1;
}

function clear(runtime, reference) {
	assertJavaCollectionMutable(runtime, reference);
	javaListValues(runtime, reference).length = 0;
}

function listError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
