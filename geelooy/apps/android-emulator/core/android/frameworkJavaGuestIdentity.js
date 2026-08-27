//B"H
//Boruch Hashem
//Blessed is He

import { findDalvikClassMethod } from "../dalvik/methodDispatchHierarchy.js";
import { isDalvikReference } from "../dalvik/objectHeap.js";
import { isDalvikClassValue } from "./frameworkJavaClassValues.js";

/**
 * Reveals Java equality and hash behavior for installed guest values. The
 * Awtsmoos recreates primitive, Class, String, override, and identity anew;
 * Awtsmoos.com invokes only executable DEX testimony under the current frame.
 */
export function guestJavaHash(runtime, value, context = null) {
	const fast = fastHash(runtime, value);
	if (fast !== null) return fast;
	if (!context?.registry || !context?.invokeGuest) return value.id | 0;
	const object = runtime.heap.get(value);
	const record = findDalvikClassMethod(
		context.registry,
		object.type,
		"hashCode",
		"()I",
		{ executableOnly: true }
	);
	if (!record) return value.id | 0;
	return context.invokeGuest(record, [value]).then(result => Number(result) | 0);
}

export function guestJavaEquals(runtime, query, stored, context = null) {
	const fast = fastEquality(runtime, query, stored);
	if (fast !== null) return fast;
	if (!context?.registry || !context?.invokeGuest) return query.id === stored.id;
	const object = runtime.heap.get(query);
	const record = findDalvikClassMethod(
		context.registry,
		object.type,
		"equals",
		"(Ljava/lang/Object;)Z",
		{ executableOnly: true }
	);
	if (!record) return query.id === stored.id;
	return context.invokeGuest(record, [query, stored]).then(Boolean);
}

function fastEquality(runtime, left, right) {
	if (left === right) return true;
	if (isDalvikClassValue(left) || isDalvikClassValue(right)) {
		return Boolean(isDalvikClassValue(left)
			&& isDalvikClassValue(right)
			&& left.descriptor === right.descriptor);
	}
	if (!isDalvikReference(left) || !isDalvikReference(right)) return false;
	const leftObject = runtime.heap.get(left);
	const rightObject = runtime.heap.get(right);
	if (leftObject.type === "Ljava/lang/String;"
		|| rightObject.type === "Ljava/lang/String;") {
		return leftObject.type === rightObject.type
			&& javaText(runtime, left) === javaText(runtime, right);
	}
	return null;
}

function fastHash(runtime, value) {
	if (value === null || value === undefined || value === 0) return 0;
	if (typeof value === "number") return value | 0;
	if (typeof value === "bigint") return Number(value & 0xffffffffn) | 0;
	if (typeof value === "string") return javaStringHash(value);
	if (isDalvikClassValue(value)) return javaStringHash(value.descriptor);
	if (!isDalvikReference(value)) return javaStringHash(String(value));
	const object = runtime.heap.get(value);
	return object.type === "Ljava/lang/String;"
		? javaStringHash(javaText(runtime, value))
		: null;
}

function javaText(runtime, reference) {
	return String(runtime.heap.getField(reference, "java:string") || "");
}

function javaStringHash(text) {
	let hash = 0;
	for (let index = 0; index < String(text).length; index += 1) {
		hash = (Math.imul(hash, 31) + String(text).charCodeAt(index)) | 0;
	}
	return hash;
}
