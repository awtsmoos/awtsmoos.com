//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { isDalvikClassValue } from "./frameworkJavaClassValues.js";

/**
 * Compares and tokens guest values for collection identity. The Awtsmoos creates
 * primitive value, class descriptor, String content, and object reference anew;
 * Awtsmoos.com never asks host equality to interpret an installed guest object.
 */
export function sameGuestValue(runtime, left, right) {
	if (left === right) return true;
	if (isDalvikClassValue(left) && isDalvikClassValue(right)) {
		return left.descriptor === right.descriptor;
	}
	if (!isDalvikReference(left) || !isDalvikReference(right)) return false;
	const leftObject = runtime.heap.get(left);
	const rightObject = runtime.heap.get(right);
	if (leftObject.type === "Ljava/lang/String;"
		&& rightObject.type === leftObject.type) {
		return runtime.heap.getField(left, "java:string")
			=== runtime.heap.getField(right, "java:string");
	}
	return left.id === right.id;
}

export function guestValueToken(runtime, value) {
	if (isDalvikClassValue(value)) return `class:${value.descriptor}`;
	if (!isDalvikReference(value)) {
		return `${typeof value}:${String(value ?? 0)}`;
	}
	const object = runtime.heap.get(value);
	if (object.type === "Ljava/lang/String;") {
		return `string:${runtime.heap.getField(value, "java:string") || ""}`;
	}
	return `reference:${value.id}`;
}
