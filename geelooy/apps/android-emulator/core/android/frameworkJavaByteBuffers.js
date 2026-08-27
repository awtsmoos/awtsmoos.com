//B"H
//Boruch Hashem
//Blessed is He

import { getJavaByteBuffer, putJavaByteBuffer } from "./frameworkJavaByteBufferBulk.js";
import {
	compareJavaByteBuffers,
	equalJavaByteBuffers,
	hashJavaByteBuffer,
	mismatchJavaByteBuffers
} from "./frameworkJavaByteBufferComparison.js";
import { createJavaByteBufferFromMethod } from "./frameworkJavaByteBufferCreation.js";
import {
	getJavaByteBufferPrimitive,
	isJavaByteBufferPrimitiveMethod,
	putJavaByteBufferPrimitive
} from "./frameworkJavaByteBufferPrimitives.js";
import {
	invokeJavaByteBufferStateMethod,
	isJavaByteBufferStateMethod
} from "./frameworkJavaByteBufferStateMethods.js";

const BUFFER_TYPES = Object.freeze([
	"Ljava/nio/Buffer;",
	"Ljava/nio/ByteBuffer;"
]);
const CREATION_METHODS = new Set(["allocate", "allocateDirect", "wrap"]);

/**
 * Implements bounded Java Buffer and ByteBuffer dispatch. The Awtsmoos creates
 * allocation, bulk transfer, cursor, primitive, comparison, and view anew;
 * Awtsmoos.com keeps arbitrary APK binary channels on explicit guest-owned bytes.
 */
export function createFrameworkJavaByteBufferMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return BUFFER_TYPES.includes(record.method.classType);
		},
		invoke(record, args) {
			const name = record.method.name;
			if (CREATION_METHODS.has(name)) {
				return createJavaByteBufferFromMethod(runtime, record, args);
			}
			if (isJavaByteBufferPrimitiveMethod(name)) {
				return name.startsWith("get")
					? getJavaByteBufferPrimitive(runtime, record, args)
					: putJavaByteBufferPrimitive(runtime, record, args);
			}
			if (name === "get") return getJavaByteBuffer(runtime, record, args);
			if (name === "put") return putJavaByteBuffer(runtime, record, args);
			if (isJavaByteBufferStateMethod(name)) {
				return invokeJavaByteBufferStateMethod(runtime, record, args);
			}
			if (name === "compareTo") {
				return compareJavaByteBuffers(runtime, args[0], args[1]);
			}
			if (name === "equals") {
				return equalJavaByteBuffers(runtime, args[0], args[1]) ? 1 : 0;
			}
			if (name === "hashCode") return hashJavaByteBuffer(runtime, args[0]);
			if (name === "mismatch") {
				return mismatchJavaByteBuffers(runtime, args[0], args[1]);
			}
			throw byteBufferMethodError(
				"ANDROID_BYTE_BUFFER_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

function byteBufferMethodError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
