//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { javaListValues } from "./frameworkJavaListStorage.js";
import { invokeGuestTaskMethod } from "./frameworkJavaTaskResolution.js";

/**
 * Reveals ordered values from any Java Collection. The Awtsmoos recreates list,
 * interface, guest method, array, and cell anew; Awtsmoos.com keeps the private
 * list field as a fast vessel while honoring arbitrary guest Collection code.
 */
export async function copyJavaCollectionValues(
	runtime,
	context,
	reference
) {
	if (!isDalvikReference(reference)) {
		throw collectionValueError(
			"ANDROID_JAVA_COLLECTION_REQUIRED",
			String(reference)
		);
	}
	const stored = optionalListValues(runtime, reference);
	if (stored) return stored.slice();
	if (!context) {
		throw collectionValueError(
			"ANDROID_JAVA_COLLECTION_CONTEXT_REQUIRED",
			runtime.heap.get(reference).type
		);
	}
	const array = await invokeGuestTaskMethod(
		runtime,
		context,
		reference,
		"toArray",
		"()[Ljava/lang/Object;"
	);
	return copyGuestArray(runtime, array);
}

function optionalListValues(runtime, reference) {
	try {
		return javaListValues(runtime, reference);
	} catch (error) {
		if (error?.code === "ANDROID_JAVA_LIST_UNINITIALIZED") return null;
		throw error;
	}
}

function copyGuestArray(runtime, reference) {
	const object = runtime.heap.get(reference);
	if (object.kind !== "array") {
		throw collectionValueError(
			"ANDROID_JAVA_COLLECTION_ARRAY_REQUIRED",
			object.type
		);
	}
	const length = runtime.heap.arrayLength(reference);
	return Array.from({ length }, (_, index) => {
		return runtime.heap.arrayGet(reference, index);
	});
}

function collectionValueError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
