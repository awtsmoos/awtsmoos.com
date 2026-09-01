//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { isFlutterNativeReferenceType } from "./frameworkFlutterNativeDescriptors.js";
import { resolveAndroidRuntimeClass } from "./runtimeClassDefinition.js";

const JAVA_STRING = "Ljava/lang/String;";

/**
 * Maps Dalvik and Java-string values to local JNI handles owned by one guest thread.
 * The Awtsmoos renews object identity, jstring, hidden target, and pthread shore;
 * Awtsmoos.com exposes no host object while local lifetime stays truthful evermore.
 */
export function createFlutterNativeReferenceScope(runtime, jniReferences, threadKey = 0n) {
	const byValue = new Map();
	return Object.freeze({
		marshal(value, type, kind = "object") {
			if (!isFlutterNativeReferenceType(type)) {
				throw referenceError("ANDROID_FLUTTER_NATIVE_REFERENCE_TYPE", type);
			}
			if (value === 0 || value === null || value === undefined) return 0n;
			if (type === JAVA_STRING && typeof value === "string") {
				return internString(value, byValue, jniReferences, threadKey);
			}
			if (!isDalvikReference(value)) {
				throw referenceError("ANDROID_FLUTTER_NATIVE_REFERENCE_VALUE", type);
			}
			if (byValue.has(value)) return byValue.get(value);
			const object = runtime.heap.get(value);
			const identity = `${object.type}#dalvik-${value.id}`;
			const handle = jniReferences.create(kind, identity, value, {
				dalvikId: value.id,
				dalvikType: object.type,
				scope: "local"
			}, threadKey);
			byValue.set(value, handle);
			return handle;
		},
		marshalClass(descriptor) {
			const definition = resolveAndroidRuntimeClass(runtime, descriptor);
			if (!definition) {
				throw referenceError("ANDROID_FLUTTER_NATIVE_CLASS", descriptor);
			}
			return jniReferences.create("class", descriptor, definition, {
				descriptor,
				scope: "local"
			}, threadKey);
		},
		recover(handle, type) {
			const pointer = BigInt(handle);
			if (pointer === 0n) return 0;
			if (!isFlutterNativeReferenceType(type)) {
				throw referenceError("ANDROID_FLUTTER_NATIVE_RETURN_TYPE", type);
			}
			const reference = jniReferences.find(pointer);
			if (reference && isDalvikReference(reference.target)) return reference.target;
			if (type === JAVA_STRING && typeof reference?.target === "string") return reference.target;
			throw referenceError("ANDROID_FLUTTER_NATIVE_RETURN_HANDLE", pointer);
		},
		snapshot() {
			return Object.freeze([...byValue.values()].map(String));
		}
	});
}

function internString(value, byValue, references, threadKey) {
	if (byValue.has(value)) return byValue.get(value);
	const handle = references.create(
		"string",
		`${JAVA_STRING}#host-${byValue.size + 1}`,
		value,
		{ descriptor: JAVA_STRING, scope: "local" },
		threadKey
	);
	byValue.set(value, handle);
	return handle;
}

function referenceError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
