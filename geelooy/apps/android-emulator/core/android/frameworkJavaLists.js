//B"H
//Boruch Hashem
//Blessed is He

import { JAVA_ARRAYS_LIST } from "./frameworkJavaArraysAsListState.js";
import {
	addAllJavaListCollection,
	initializeJavaListCollection
} from "./frameworkJavaListCollections.js";
import { createJavaIterator } from "./frameworkJavaIterators.js";
import { javaListToArray } from "./frameworkJavaListArrays.js";
import {
	addJavaListValue,
	clearJavaListValues,
	removeJavaListValue,
	setJavaListValue
} from "./frameworkJavaListMutations.js";
import {
	findJavaListIndex,
	findLastJavaListIndex,
	javaListValues,
	validJavaListIndex
} from "./frameworkJavaListStorage.js";

const LIST_TYPES = Object.freeze([
	"Ljava/util/ArrayList;",
	JAVA_ARRAYS_LIST,
	"Ljava/util/LinkedList;",
	"Ljava/util/List;"
]);

/**
 * Routes ordered Java list behavior. The Awtsmoos recreates lookup, iterator,
 * array view, and mutation vessel anew; Awtsmoos.com lets each concrete list
 * preserve its own covenant while sharing bounded interface crossings.
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
			if (name === "add") return addJavaListValue(runtime, record, args);
			if (name === "addAll") {
				return addAllJavaListCollection(runtime, context, record, args);
			}
			if (name === "get") return get(runtime, args);
			if (name === "set") return setJavaListValue(runtime, args);
			if (name === "remove") return removeJavaListValue(runtime, record, args);
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
			if (name === "clear") return clearJavaListValues(runtime, args[0]);
			if (name === "toArray") return javaListToArray(runtime, record, args);
			throw listError("ANDROID_JAVA_LIST_METHOD_UNSUPPORTED", record.signature);
		}
	});
}

function get(runtime, args) {
	const values = javaListValues(runtime, args[0]);
	return values[validJavaListIndex(values, args[1])] ?? 0;
}

function listError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
