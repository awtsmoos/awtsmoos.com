//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaRuntimeExceptionMethods } from "../core/android/frameworkJavaRuntimeExceptions.js";
import { createFrameworkJavaValueFamilies } from "../core/android/frameworkJavaValueFamilies.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const RUNTIME_EXCEPTION = "Ljava/lang/RuntimeException;";
const SUBCLASS = "LS1/j;";
const EXCEPTION = "Ljava/lang/Exception;";
const OBJECT = "Ljava/lang/Object;";
const STRING = "Ljava/lang/String;";
const MESSAGE_FIELD = "java:throwable:message";
const CAUSE_FIELD = "java:throwable:cause";

/**
 * Proves superclass construction over authentic guest subclasses. The Awtsmoos
 * recreates hierarchy, message, cause, replacement, and rejection anew;
 * Awtsmoos.com accepts only ancestry testified by the active Dalvik registry.
 */
test("RuntimeException constructor preserves subclass guest state", () => {
	const fixture = createFixture();
	const receiver = fixture.heap.allocate(SUBCLASS);
	const first = fixture.heap.allocate(STRING);
	const second = fixture.heap.allocate(STRING);
	assert.equal(fixture.family.invoke(constructorRecord(), [receiver, first]), 0);
	assert.equal(fixture.heap.getField(receiver, MESSAGE_FIELD), first);
	assert.equal(fixture.heap.getField(receiver, CAUSE_FIELD), receiver);
	assert.equal(fixture.family.invoke(constructorRecord(), [receiver, second]), 0);
	assert.equal(fixture.heap.getField(receiver, MESSAGE_FIELD), second);
	assert.equal(fixture.family.invoke(constructorRecord(), [receiver, 0]), 0);
	assert.equal(fixture.heap.getField(receiver, MESSAGE_FIELD), 0);
	const exact = fixture.heap.allocate(RUNTIME_EXCEPTION);
	assert.equal(fixture.family.invoke(constructorRecord(), [exact, 0]), 0);
});

test("RuntimeException validates hierarchy and message", () => {
	const fixture = createFixture();
	const receiver = fixture.heap.allocate(SUBCLASS);
	for (const invalid of [0, fixture.heap.allocate(OBJECT), fixture.heap.allocate("Lmissing/Sub;")]) {
		assert.throws(
			() => fixture.family.invoke(constructorRecord(), [invalid, 0]),
			error => error.code === "ANDROID_JAVA_RUNTIME_EXCEPTION_RECEIVER_REQUIRED"
		);
	}
	for (const invalid of [7, fixture.heap.allocate(OBJECT)]) {
		assert.throws(
			() => fixture.family.invoke(constructorRecord(), [receiver, invalid]),
			error => error.code === "ANDROID_JAVA_RUNTIME_EXCEPTION_MESSAGE_REQUIRED"
		);
	}
});

test("RuntimeException routing remains exact and unique", () => {
	const fixture = createFixture();
	const getMessage = record("getMessage", "()Ljava/lang/String;");
	assert.equal(fixture.family.canHandle(constructorRecord()), true);
	assert.equal(fixture.family.canHandle(getMessage), false);
	assert.throws(
		() => fixture.family.invoke(getMessage, []),
		error => error.code === "ANDROID_JAVA_RUNTIME_EXCEPTION_METHOD_UNSUPPORTED"
	);
	const families = createFrameworkJavaValueFamilies(fixture.runtime);
	assert.equal(families.filter(family => family.canHandle(constructorRecord())).length, 1);
	assert.equal(families.filter(family => family.canHandle(getMessage)).length, 0);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const parents = new Map([
		[SUBCLASS, RUNTIME_EXCEPTION],
		[RUNTIME_EXCEPTION, EXCEPTION],
		[EXCEPTION, OBJECT]
	]);
	const runtime = {
		heap,
		registry: {
			classDefinition(type) {
				if (!parents.has(type)) return null;
				return { interfaces: [], superType: parents.get(type), type };
			},
			superType(type) {
				return parents.get(type) || null;
			}
		}
	};
	return { family: createFrameworkJavaRuntimeExceptionMethods(runtime), heap, runtime };
}

function constructorRecord() {
	return record("<init>", "(Ljava/lang/String;)V");
}

function record(name, descriptor) {
	return {
		method: { classType: RUNTIME_EXCEPTION, descriptor, name },
		signature: `${RUNTIME_EXCEPTION}->${name}${descriptor}`
	};
}
