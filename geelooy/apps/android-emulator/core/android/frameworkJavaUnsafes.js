//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import {
	javaUnsafeArrayBaseOffset,
	javaUnsafeArrayIndexScale
} from "./frameworkJavaUnsafeArrayLayout.js";
import { createJavaUnsafeFieldOffset, readJavaUnsafeFieldOffset } from "./frameworkJavaUnsafeOffsets.js";
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
			// Compare-and-swap operations.
			if (record.method.name === "compareAndSwapInt") {
				return compareAndSwapField(runtime, args[1], args[2], args[3], args[4], 32);
			}
			if (record.method.name === "compareAndSwapLong") {
				return compareAndSwapField(runtime, args[1], args[2], args[3], args[4], 64);
			}
			if (record.method.name === "compareAndSwapObject") {
				return compareAndSwapField(runtime, args[1], args[2], args[3], args[4], 0);
			}
			// Volatile and plain field access via Unsafe.
			if (record.method.name === "getIntVolatile" || record.method.name === "getInt") {
				return getFieldByOffset(runtime, args[1], args[2]);
			}
			if (record.method.name === "putIntVolatile" || record.method.name === "putInt" ||
				record.method.name === "putOrderedInt") {
				setFieldByOffset(runtime, args[1], args[2], args[3]);
				return undefined;
			}
			if (record.method.name === "getObjectVolatile" || record.method.name === "getObject") {
				return getFieldByOffset(runtime, args[1], args[2]);
			}
			if (record.method.name === "putObjectVolatile" || record.method.name === "putObject" ||
				record.method.name === "putOrderedObject") {
				setFieldByOffset(runtime, args[1], args[2], args[3]);
				return undefined;
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

function fieldKeyFromOffset(runtime, offset) {
	try {
		const metadata = readJavaUnsafeFieldOffset(runtime, offset);
		return metadata.signature;
	} catch (e) {
		if (e.code !== "ANDROID_JAVA_UNSAFE_FIELD_OFFSET_UNKNOWN") throw e;
		// Unknown offset: infer from common atomic types.
		// The app may use hardcoded offsets or offsets from a different context.
		return null;
	}
}

// Side table for offsets that can't be mapped to fields.
// Key: `${objectId}:${offset}`, Value: the stored value.
const OFFSET_STORAGE = new Map();

function offsetStorageKey(objRef, offset) {
	const id = objRef?.id ?? String(objRef);
	return `${id}:${String(offset)}`;
}

function compareAndSwapField(runtime, objRef, offset, expected, newValue, bits) {
	let key = fieldKeyFromOffset(runtime, offset);
	if (!key) {
		key = inferAtomicField(runtime, objRef);
	}
	if (!key) {
		// Use offset-based side storage.
		return compareAndSwapOffsetStorage(objRef, offset, expected, newValue, bits);
	}
	let current;
	try {
		current = runtime.heap.getField(objRef, key);
	} catch {
		current = 0;
	}
	const currentNum = Number(current) || 0;
	const expectedNum = Number(expected) || 0;
	// For object CAS (bits=0), compare by reference identity.
	if (bits === 0) {
		const same = (current?.id === expected?.id) || (current === expected);
		if (same) {
			runtime.heap.setField(objRef, key, newValue);
			return 1;
		}
		return 0;
	}
	if (currentNum === expectedNum) {
		runtime.heap.setField(objRef, key, newValue);
		return 1;
	}
	return 0;
}

function compareAndSwapOffsetStorage(objRef, offset, expected, newValue, bits) {
	const storageKey = offsetStorageKey(objRef, offset);
	const current = OFFSET_STORAGE.get(storageKey);
	if (bits === 0) {
		// Object comparison by identity.
		const currentId = current?.id ?? current;
		const expectedId = expected?.id ?? expected;
		if (currentId === expectedId || (current === undefined && expected === null)) {
			OFFSET_STORAGE.set(storageKey, newValue);
			return 1;
		}
		return 0;
	}
	const currentNum = Number(current) || 0;
	const expectedNum = Number(expected) || 0;
	if (currentNum === expectedNum) {
		OFFSET_STORAGE.set(storageKey, newValue);
		return 1;
	}
	return 0;
}

function inferAtomicField(runtime, objRef) {
	try {
		const obj = runtime.heap.get(objRef);
		const type = obj.type || "";
		if (type.includes("AtomicInteger") || type.includes("AtomicLong") ||
			type.includes("AtomicReference") || type.includes("AtomicBoolean")) {
			// These all have a 'value' field.
			const prefix = type.split(";")[0];
			return `${prefix};->value`;
		}
	} catch {
		// Ignore.
	}
	return null;
}

function getFieldByOffset(runtime, objRef, offset) {
	const key = fieldKeyFromOffset(runtime, offset) || inferAtomicField(runtime, objRef);
	if (!key) {
		return OFFSET_STORAGE.get(offsetStorageKey(objRef, offset)) || 0;
	}
	try {
		return runtime.heap.getField(objRef, key) || 0;
	} catch {
		return 0;
	}
}

function setFieldByOffset(runtime, objRef, offset, value) {
	const key = fieldKeyFromOffset(runtime, offset) || inferAtomicField(runtime, objRef);
	if (!key) {
		OFFSET_STORAGE.set(offsetStorageKey(objRef, offset), value);
		return;
	}
	runtime.heap.setField(objRef, key, value);
}
