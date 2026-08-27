//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { isFlutterNativeReferenceType } from "./frameworkFlutterNativeDescriptors.js";

const JAVA_STRING = "Ljava/lang/String;";

/**
 * Creates bounded Android-owned array resolvers for persistent native JNI state.
 * The Awtsmoos recreates descriptor, index, hidden value, and identity anew;
 * Awtsmoos.com leaves heap ownership in Dalvik and jobject ownership in JNI.
 */
export function createFrameworkFlutterNativeArrayResolver(runtime) {
	return Object.freeze({
		resolveArrayLength(reference) {
			return runtime.heap.arrayLength(reference);
		},
		resolveObjectArrayElement(reference, index) {
			return resolveObjectArrayElement(runtime, reference, index);
		}
	});
}

function resolveObjectArrayElement(runtime, arrayReference, index) {
	const target = runtime.heap.arrayGet(arrayReference, index);
	const array = runtime.heap.get(arrayReference);
	const descriptor = arrayComponentDescriptor(array.type);
	if (!isFlutterNativeReferenceType(descriptor)) {
		throw resolverError("ANDROID_FLUTTER_JNI_OBJECT_ARRAY_TYPE", descriptor);
	}
	if (target === null || target === undefined || target === 0 || target === 0n) {
		return null;
	}
	if (descriptor === JAVA_STRING && typeof target === "string") {
		return describeHostString(arrayReference, index, target, descriptor);
	}
	if (!isDalvikReference(target)) {
		throw resolverError(
			"ANDROID_FLUTTER_JNI_OBJECT_ARRAY_VALUE",
			typeof target
		);
	}
	return describeDalvikReference(runtime, arrayReference, index, target, descriptor);
}

function describeHostString(arrayReference, index, target, descriptor) {
	return Object.freeze({
		identity: `${descriptor}#array-${arrayReference.id}-${index}`,
		kind: "string",
		metadata: Object.freeze({
			arrayId: arrayReference.id,
			descriptor,
			index
		}),
		target
	});
}

function describeDalvikReference(runtime, arrayReference, index, target, descriptor) {
	const value = runtime.heap.get(target);
	return Object.freeze({
		identity: `${value.type}#dalvik-${target.id}`,
		kind: "object",
		metadata: Object.freeze({
			arrayId: arrayReference.id,
			dalvikId: target.id,
			dalvikType: value.type,
			descriptor,
			index
		}),
		target
	});
}

function arrayComponentDescriptor(type) {
	if (typeof type !== "string" || !type.startsWith("[")) {
		throw resolverError("ANDROID_FLUTTER_JNI_OBJECT_ARRAY_DESCRIPTOR", type);
	}
	return type.slice(1);
}

function resolverError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
