//B"H
//Boruch Hashem
//Blessed is He

import { assertJavaCollectionMutable } from "./frameworkJavaCollectionPolicy.js";
import * as collections from "./frameworkJavaCollectionStorage.js";
import { createJavaIterator } from "./frameworkJavaIterators.js";
import * as operations from "./frameworkJavaSetOperations.js";
import { initializeJavaSet } from "./frameworkJavaSetStorage.js";

const SET_TYPES = new Set([
	"Ljava/lang/Iterable;",
	"Ljava/util/AbstractCollection;",
	"Ljava/util/Collection;",
	"Ljava/util/HashSet;",
	"Ljava/util/LinkedHashSet;",
	"Ljava/util/Set;"
]);

/**
 * Dispatches Set and Collection behavior through guest equality and hashing. The
 * Awtsmoos recreates uniqueness, relation, mutation, and hash sum anew;
 * Awtsmoos.com carries every executable key covenant through the current frame.
 */
export function createFrameworkJavaSetMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return SET_TYPES.has(record.method.classType);
		},
		invoke(record, args, dispatch, context) {
			return invokeSet(runtime, record, args, context);
		}
	});
}

function invokeSet(runtime, record, args, context) {
	const name = record.method.name;
	if (name === "<init>") return initialize(runtime, record, args, context);
	if (name === "add") return mutateBoolean(runtime, args[0], () => collections.addCollectionValue(runtime, args[0], args[1], context));
	if (name === "addAll") return mutate(runtime, args[0], () => operations.addAllToSet(runtime, args[0], args[1], context));
	if (name === "clear") return mutate(runtime, args[0], () => collections.clearCollection(runtime, args[0]));
	if (name === "contains") return booleanResult(collections.containsCollectionValue(runtime, args[0], args[1], context));
	if (name === "containsAll") return operations.setContainsAll(runtime, args[0], args[1], context);
	if (name === "isEmpty") return collections.collectionValues(runtime, args[0]).length ? 0 : 1;
	if (name === "iterator") return createJavaIterator(runtime, args[0]);
	if (name === "remove") return mutateBoolean(runtime, args[0], () => collections.removeCollectionValue(runtime, args[0], args[1], context));
	if (name === "removeAll") return mutate(runtime, args[0], () => operations.removeAllFromSet(runtime, args[0], args[1], context));
	if (name === "size") return collections.collectionValues(runtime, args[0]).length;
	if (name === "toArray") return operations.setToArray(runtime, args[0], args[1]);
	if (name === "equals") return operations.setsEqual(runtime, args[0], args[1], context);
	if (name === "hashCode") return operations.setHashCode(runtime, args[0], context);
	throw setError("ANDROID_JAVA_SET_METHOD_UNSUPPORTED", record.signature);
}

function initialize(runtime, record, args, context) {
	const values = record.method.descriptor.includes("Ljava/util/Collection;")
		? collections.collectionValues(runtime, args[1])
		: [];
	return initializeJavaSet(runtime, args[0], values, context);
}

function mutate(runtime, reference, operation) {
	assertJavaCollectionMutable(runtime, reference);
	return operation();
}

function mutateBoolean(runtime, reference, operation) {
	return booleanResult(mutate(runtime, reference, operation));
}

function booleanResult(value) {
	return value instanceof Promise ? value.then(result => result ? 1 : 0) : value ? 1 : 0;
}

function setError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
