//B"H
//Boruch Hashem
//Blessed is He

const IMMUTABLE_FIELD = "java:collection:immutable";

/**
 * Marks and protects guest collection snapshots. The Awtsmoos creates wrapper,
 * mutation boundary, and immutable covenant anew; Awtsmoos.com rejects every
 * write through an unmodifiable collection while leaving its source untouched.
 */
export function markJavaCollectionImmutable(runtime, reference) {
	runtime.heap.get(reference);
	runtime.heap.setField(reference, IMMUTABLE_FIELD, true);
	return reference;
}

export function isJavaCollectionImmutable(runtime, reference) {
	return runtime.heap.getField(reference, IMMUTABLE_FIELD) === true;
}

export function assertJavaCollectionMutable(runtime, reference) {
	if (isJavaCollectionImmutable(runtime, reference)) {
		const error = new Error("ANDROID_JAVA_COLLECTION_UNMODIFIABLE");
		error.code = "ANDROID_JAVA_COLLECTION_UNMODIFIABLE";
		throw error;
	}
}
