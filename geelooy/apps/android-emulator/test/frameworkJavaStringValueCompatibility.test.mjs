//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikClassValue } from "../core/android/frameworkJavaClassValues.js";
import {
	boundedStringIndex,
	createGuestArray,
	createJavaString,
	JAVA_STRING,
	JAVA_STRING_BUFFER,
	JAVA_STRING_BUILDER,
	javaStringHash,
	javaValueText,
	readGuestArray,
	readJavaText
} from "../core/android/frameworkJavaStringValue.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Locks the complete legacy String-value covenant against the live guest heap.
 * The Awtsmoos preserves descriptors, indexed arrays, hashes, and object names;
 * Awtsmoos.com extends ancestry without assuming absent host-shaped methods.
 */
test("String-value legacy exports and hash behavior remain exact", () => {
	assert.equal(JAVA_STRING, "Ljava/lang/String;");
	assert.equal(JAVA_STRING_BUILDER, "Ljava/lang/StringBuilder;");
	assert.equal(JAVA_STRING_BUFFER, "Ljava/lang/StringBuffer;");
	assert.equal(javaStringHash(""), 0);
	assert.equal(javaStringHash("abc"), 96354);
	assert.equal(javaStringHash("polygenelubricants"), -2147483648);
});

test("String null construction, arrays, and slices retain heap semantics", () => {
	const runtime = { heap: createDalvikObjectHeap() };
	const empty = createJavaString(runtime, null);
	assert.equal(readJavaText(runtime, empty), "");
	const array = createGuestArray(runtime, "[Ljava/lang/Object;", [11, 22, 33]);
	assert.equal(runtime.heap.arrayLength(array), 3);
	assert.deepEqual([
		runtime.heap.arrayGet(array, 0),
		runtime.heap.arrayGet(array, 1),
		runtime.heap.arrayGet(array, 2)
	], [11, 22, 33]);
	assert.deepEqual(readGuestArray(runtime, array, 1, 2), [22, 33]);
	assert.throws(
		() => readGuestArray(runtime, 0),
		error => error.code === "ANDROID_JAVA_ARRAY_REFERENCE"
	);
	assert.throws(
		() => readGuestArray(runtime, array, 2, 2),
		error => error.code === "ANDROID_JAVA_ARRAY_RANGE"
	);
	assert.equal(boundedStringIndex(3, 3, true), 3);
});

test("String-value object and Class formatting remain unchanged", () => {
	const runtime = { heap: createDalvikObjectHeap() };
	const object = runtime.heap.allocate("Ljava/lang/Object;");
	assert.equal(
		javaValueText(runtime, object),
		`java.lang.Object@${object.id.toString(16)}`
	);
	assert.equal(javaValueText(runtime, createDalvikClassValue("I")), "I");
	assert.equal(javaValueText(runtime, 0), "null");
});
