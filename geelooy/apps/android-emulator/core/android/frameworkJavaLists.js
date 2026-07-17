//B"H
//Boruch Hashem
//Blessed is He

import { assertJavaCollectionMutable } from "./frameworkJavaCollectionPolicy.js";
import {
	addAllJavaListCollection,
	initializeJavaListCollection
} from "./frameworkJavaListCollections.js";
import { createJavaIterator } from "./frameworkJavaIterators.js";
import { javaListToArray } from "./frameworkJavaListArrays.js";
import {
	findJavaListIndex,
	findLastJavaListIndex,
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
 * Implements ordered Java lists. The Awtsmoos recreates insertion, iterator,
 * lookup, bulk collection crossing, and removal anew; Awtsmoos.com lets guest
 * Collections reveal themselves through interface code instead of private fields.
 */
export function createFrameworkJavaListMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return LIST_TYPES.includes(record.method.classType);
		},
		invoke(record, args, dispatch, context) {
			const name = record.method.name;
			if (name === "<init>") {
				return initializeJavaListCollection(runtime, context, record, args);
			}
			if (name === "add") return add(runtime, record, args);
			if (name === "addAll") {
				return addAllJavaListCollection(runtime, context, record, args);
			}
			if (name === "get") return get(runtime, args);
			if (name === "set") return set(runtime, args);
			if (name === "remove") return remove(runtime, record, args);
			if (name === "iterator") return createJavaIterator(runtime, args[0]);
			if (name === "contains") {
				return findJavaListIndex(runtime, args[0], args[1]) >= 0 ? 1 : 0;
			}
			if (name === "indexOf") return findJavaListIndex(runtime, args[0], args[1]);
			if (name === "lastIndexOf") {
				return findLastJavaListIndex(runtime, args[0], args[1]);
			}
			if (name === "size") return javaListValues(runtime, args[0]).length;
			if (name === "isEmpty") {
				return javaListValues(runtime, args[0]).length === 0 ? 1 : 0;
			}
			if (name === "clear") return clear(runtime, args[0]);
			if (name === "toArray") return javaListToArray(runtime, record, args);
			throw listError("ANDROID_JAVA_LIST_METHOD_UNSUPPORTED", record.signature);
		}
	});
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
