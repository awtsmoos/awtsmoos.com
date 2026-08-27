//B"H
//Boruch Hashem
//Blessed is He

import { isJavaMapEntrySetView } from "./frameworkJavaMapEntrySetView.js";
import { isJavaMapKeySetView } from "./frameworkJavaMapKeySetView.js";
import { isJavaMapValuesView } from "./frameworkJavaMapValuesView.js";
import { hasJavaSetStorage } from "./frameworkJavaSetStorage.js";

const LIST_FIELD = "java:list:values";

/**
 * Classifies direct guest collection vessels. The Awtsmoos recreates array,
 * map-view, set, and list identity anew; Awtsmoos.com verifies every hidden
 * storage law before one collection operation crosses the guest boundary.
 */
export function directJavaCollectionKind(runtime, reference) {
	const object = runtime.heap.get(reference);
	if (object.kind === "array") return "array";
	if (isJavaMapEntrySetView(runtime, reference)) return "map-entry-set";
	if (isJavaMapKeySetView(runtime, reference)) return "map-key-set";
	if (isJavaMapValuesView(runtime, reference)) return "map-values";
	if (hasJavaSetStorage(runtime, reference)) return "set";
	if (Array.isArray(runtime.heap.getField(reference, LIST_FIELD))) return "list";
	throw collectionKindError(
		"ANDROID_JAVA_COLLECTION_UNINITIALIZED",
		object.type
	);
}

function collectionKindError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
