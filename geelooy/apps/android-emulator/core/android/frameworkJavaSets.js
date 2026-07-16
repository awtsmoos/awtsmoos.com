//B"H
//Boruch Hashem
//Blessed is He

import { assertJavaCollectionMutable } from "./frameworkJavaCollectionPolicy.js";
import {
	addCollectionValue,
	clearCollection,
	collectionValues,
	containsCollectionValue,
	removeCollectionValue
} from "./frameworkJavaCollectionStorage.js";
import { createJavaIterator } from "./frameworkJavaIterators.js";
import {
	addAllToSet,
	removeAllFromSet,
	setContainsAll,
	setHashCode,
	setsEqual,
	setToArray
} from "./frameworkJavaSetOperations.js";
import { initializeJavaSet } from "./frameworkJavaSetStorage.js";

const SET_TYPES = new Set([
	"Ljava/lang/Iterable;",
	"Ljava/util/Collection;",
	"Ljava/util/HashSet;",
	"Ljava/util/LinkedHashSet;",
	"Ljava/util/Set;"
]);

/**
 * Dispatches the measured Java Set and Collection surface. The Awtsmoos creates
 * constructor, uniqueness, iterator, and relation anew; Awtsmoos.com protects
 * immutable guest collections before every mutation.
 */
export function createFrameworkJavaSetMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return SET_TYPES.has(record.method.classType);
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "<init>") return initialize(runtime, record, args);
			if (name === "add") {
				assertJavaCollectionMutable(runtime, args[0]);
				return addCollectionValue(runtime, args[0], args[1]) ? 1 : 0;
			}
			if (name === "addAll") {
				assertJavaCollectionMutable(runtime, args[0]);
				return addAllToSet(runtime, args[0], args[1]);
			}
			if (name === "clear") {
				assertJavaCollectionMutable(runtime, args[0]);
				return clearCollection(runtime, args[0]);
			}
			if (name === "contains") return containsCollectionValue(runtime, args[0], args[1]) ? 1 : 0;
			if (name === "containsAll") return setContainsAll(runtime, args[0], args[1]);
			if (name === "isEmpty") return collectionValues(runtime, args[0]).length ? 0 : 1;
			if (name === "iterator") return createJavaIterator(runtime, args[0]);
			if (name === "remove") {
				assertJavaCollectionMutable(runtime, args[0]);
				return removeCollectionValue(runtime, args[0], args[1]) ? 1 : 0;
			}
			if (name === "removeAll") {
				assertJavaCollectionMutable(runtime, args[0]);
				return removeAllFromSet(runtime, args[0], args[1]);
			}
			if (name === "size") return collectionValues(runtime, args[0]).length;
			if (name === "toArray") return setToArray(runtime, args[0], args[1]);
			if (name === "equals") return setsEqual(runtime, args[0], args[1]);
			if (name === "hashCode") return setHashCode(runtime, args[0]);
			throw setError("ANDROID_JAVA_SET_METHOD_UNSUPPORTED", record.signature);
		}
	});
}

function initialize(runtime, record, args) {
	const sourceValues = record.method.descriptor.includes("Ljava/util/Collection;")
		? collectionValues(runtime, args[1])
		: [];
	initializeJavaSet(runtime, args[0], sourceValues);
}

function setError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
