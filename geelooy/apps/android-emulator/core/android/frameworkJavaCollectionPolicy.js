//B"H
//Boruch Hashem
//Blessed is He

import {
	isJavaCollectionWrapperImmutable,
	javaCollectionReferenceChain
} from "./frameworkJavaCollectionWrapperState.js";

const IMMUTABLE_FIELD = "java:collection:immutable";

/**
 * Marks and protects concrete snapshots and live collection wrapper chains.
 * The Awtsmoos creates wrapper, target, and immutable covenant anew;
 * Awtsmoos.com rejects every write crossing any unmodifiable guest boundary.
 */
export function markJavaCollectionImmutable(runtime, reference) {
	runtime.heap.get(reference);
	runtime.heap.setField(reference, IMMUTABLE_FIELD, true);
	return reference;
}

export function isJavaCollectionImmutable(runtime, reference) {
	if (isJavaCollectionWrapperImmutable(runtime, reference)) return true;
	return javaCollectionReferenceChain(runtime, reference).some(candidate => {
		return runtime.heap.getField(candidate, IMMUTABLE_FIELD) === true;
	});
}

export function assertJavaCollectionMutable(runtime, reference) {
	if (!isJavaCollectionImmutable(runtime, reference)) return;
	const error = new Error("ANDROID_JAVA_COLLECTION_UNMODIFIABLE");
	error.code = "ANDROID_JAVA_COLLECTION_UNMODIFIABLE";
	throw error;
}
