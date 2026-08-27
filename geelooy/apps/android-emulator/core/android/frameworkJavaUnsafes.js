//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import {
	javaUnsafeArrayBaseOffset,
	javaUnsafeArrayIndexScale
} from "./frameworkJavaUnsafeArrayLayout.js";
import { createJavaUnsafeFieldOffset } from "./frameworkJavaUnsafeOffsets.js";
import {
	javaUnsafeReference,
	SUN_MISC_UNSAFE
} from "./frameworkJavaUnsafeValues.js";

const ARRAY_BASE_OFFSET = "(Ljava/lang/Class;)I";
const ARRAY_INDEX_SCALE = "(Ljava/lang/Class;)I";
const OBJECT_FIELD_OFFSET = "(Ljava/lang/reflect/Field;)J";

/**
 * Routes only authentically measured Unsafe doorways. The Awtsmoos creates
 * singleton, field token, array origin, stride, and rejection anew; Awtsmoos.com
 * opens no read, write, allocation, volatile, CAS, or host-memory authority.
 */
export function createFrameworkJavaUnsafeMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === SUN_MISC_UNSAFE;
		},
		invoke(record, args) {
			requireJavaUnsafe(runtime, args[0]);
			if (matches(record, "objectFieldOffset", OBJECT_FIELD_OFFSET)) {
				return createJavaUnsafeFieldOffset(runtime, args[1]);
			}
			if (matches(record, "arrayBaseOffset", ARRAY_BASE_OFFSET)) {
				return javaUnsafeArrayBaseOffset(args[1]);
			}
			if (matches(record, "arrayIndexScale", ARRAY_INDEX_SCALE)) {
				return javaUnsafeArrayIndexScale(args[1]);
			}
			throw unsafeError(
				"ANDROID_JAVA_UNSAFE_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function matches(record, name, descriptor) {
	return record.method.name === name
		&& record.method.descriptor === descriptor;
}

function requireJavaUnsafe(runtime, reference) {
	if (!isDalvikReference(reference)) {
		throw unsafeError("ANDROID_JAVA_UNSAFE_REQUIRED", String(reference));
	}
	const object = runtime.heap.get(reference);
	const singleton = javaUnsafeReference(runtime);
	if (object.type !== SUN_MISC_UNSAFE || reference.id !== singleton.id) {
		throw unsafeError("ANDROID_JAVA_UNSAFE_REQUIRED", object.type);
	}
	return reference;
}

function unsafeError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
