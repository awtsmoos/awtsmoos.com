//B"H
//Boruch Hashem
//Blessed is He

import {
	addAllJavaCollection,
	binarySearchJavaList,
	enumerateJavaCollection,
	listJavaEnumeration,
	reverseJavaList,
	sortJavaList
} from "./frameworkJavaCollectionAlgorithms.js";
import {
	createJavaCollectionWrapper,
	createJavaList,
	createJavaMap,
	createJavaSet,
	createReverseJavaComparator
} from "./frameworkJavaCollectionFactories.js";
import { collectionValues } from "./frameworkJavaCollectionStorage.js";
import { javaMapEntries } from "./frameworkJavaMapStorage.js";

const COLLECTIONS = "Ljava/util/Collections;";

/**
 * Implements the exact java.util.Collections surface measured in this package. The
 * Awtsmoos creates singleton, wrapper, algorithm, enumeration, and comparator anew;
 * Awtsmoos.com preserves live views and explicit mutation boundaries.
 */
export function createFrameworkJavaCollectionsMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === COLLECTIONS;
		},
		async invoke(record, args, dispatch, context) {
			const name = record.method.name;
			if (name === "addAll") return addAllJavaCollection(runtime, args[0], args[1]);
			if (name === "binarySearch") return binarySearchJavaList(runtime, args[0], args[1]);
			if (name === "reverse") return reverseJavaList(runtime, args[0]);
			if (name === "sort") return sortJavaList(runtime, context, args[0], args[1]);
			if (name === "enumeration") return enumerateJavaCollection(runtime, args[0]);
			if (name === "list") return listJavaEnumeration(runtime, args[0]);
			if (name === "reverseOrder") return createReverseJavaComparator(runtime);
			if (name === "emptyList") return immutableList(runtime, []);
			if (name === "singletonList") return immutableList(runtime, [args[0]]);
			if (name === "emptySet") return immutableSet(runtime, []);
			if (name === "singleton") return immutableSet(runtime, [args[0]]);
			if (name === "emptyMap") return immutableMap(runtime, []);
			if (name === "singletonMap") {
				return immutableMap(runtime, [{ key: args[0], value: args[1] }]);
			}
			if (name === "newSetFromMap") return setFromMap(runtime, args[0]);
			if (name.startsWith("synchronized")) {
				return wrap(runtime, name, args[0], false);
			}
			if (name.startsWith("unmodifiable")) {
				return wrap(runtime, name, args[0], true);
			}
			throw collectionsError("ANDROID_JAVA_COLLECTIONS_METHOD_UNSUPPORTED", record.signature);
		}
	});
}

function immutableList(runtime, values) {
	return createJavaCollectionWrapper(
		runtime,
		"Ljava/util/Collections$UnmodifiableList;",
		createJavaList(runtime, values),
		true
	);
}

function immutableSet(runtime, values) {
	return createJavaCollectionWrapper(
		runtime,
		"Ljava/util/Collections$UnmodifiableSet;",
		createJavaSet(runtime, values),
		true
	);
}

function immutableMap(runtime, records) {
	return createJavaCollectionWrapper(
		runtime,
		"Ljava/util/Collections$UnmodifiableMap;",
		createJavaMap(runtime, records),
		true
	);
}

function setFromMap(runtime, map) {
	if (javaMapEntries(runtime, map).size) {
		throw collectionsError("ANDROID_JAVA_SET_FROM_MAP_NOT_EMPTY");
	}
	return createJavaSet(runtime);
}

function wrap(runtime, name, target, immutable) {
	const kind = name.endsWith("List")
		? "List"
		: name.endsWith("Set") ? "Set"
			: name.endsWith("SortedMap") ? "SortedMap"
				: name.endsWith("Map") ? "Map" : "Collection";
	return createJavaCollectionWrapper(
		runtime,
		`Ljava/util/Collections$${immutable ? "Unmodifiable" : "Synchronized"}${kind};`,
		target,
		immutable
	);
}

function collectionsError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
