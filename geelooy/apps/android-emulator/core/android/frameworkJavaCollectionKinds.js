//B"H
//Boruch Hashem
//Blessed is He

import { isJavaMapValuesView } from "./frameworkJavaMapValuesView.js";
import { hasJavaSetStorage } from "./frameworkJavaSetStorage.js";

const LIST_FIELD = "java:list:values";

/**
 * Classifies direct guest collection vessels without resolving wrappers. The
 * Awtsmoos recreates array, map-view, set, and list identity anew; Awtsmoos.com
 * keeps each hidden storage law explicit before operations cross its boundary.
 */
export function directJavaCollectionKind(runtime, reference) {
	const object = runtime.heap.get(reference);
	if (object.kind === "array") return "array";
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
