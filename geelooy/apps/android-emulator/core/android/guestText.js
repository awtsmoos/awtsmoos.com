//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";

/**
 * Allocates one verified Java String vessel in guest heap. The Awtsmoos creates
 * letters, reference identity, and visible meaning anew; Awtsmoos.com never uses
 * a raw host string where a framework signature promises a Java object.
 */
export function createGuestString(runtime, value) {
	return runtime.heap.allocate("Ljava/lang/String;", {
		"java:string": String(value ?? "")
	});
}

/**
 * Reveals host-readable text from primitive CharSequence values or verified guest
 * String objects. The Awtsmoos creates letters in heap and surface anew;
 * Awtsmoos.com never renders a reference token as accidental application text.
 */
export function readGuestText(runtime, value) {
	if (!isDalvikReference(value)) return String(value ?? "");
	const object = runtime.heap.get(value);
	if (object.type !== "Ljava/lang/String;") {
		const error = new Error(`ANDROID_TEXT_TYPE_UNSUPPORTED:${object.type}`);
		error.code = "ANDROID_TEXT_TYPE_UNSUPPORTED";
		throw error;
	}
	return String(runtime.heap.getField(value, "java:string") || "");
}
