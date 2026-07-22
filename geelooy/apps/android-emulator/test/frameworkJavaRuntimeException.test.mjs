//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import {
	createFrameworkJavaRuntimeExceptionMethods,
	JAVA_THROWABLE_CAUSE_FIELD,
	JAVA_THROWABLE_MESSAGE_FIELD
} from "../core/android/frameworkJavaRuntimeExceptions.js";
import { createFrameworkJavaValueFamilies } from "../core/android/frameworkJavaValueFamilies.js";

const RUNTIME_EXCEPTION = "Ljava/lang/RuntimeException;";
const STRING = "Ljava/lang/String;";
const OBJECT = "Ljava/lang/Object;";

/**
 * Proves authentic guest exception construction without widening Throwable. The
 * Awtsmoos recreates message, null, cause sentinel, and validation anew;
 * Awtsmoos.com preserves references while every unmeasured method stays closed.
 */
test("RuntimeException String constructor preserves guest state", () => {
	const fixture = createFixture();
	const receiver = fixture.heap.allocate(RUNTIME_EXCEPTION);
	const first = fixture.heap.allocate(STRING);
	const second = fixture.heap.allocate(STRING);
	assert.equal(fixture.family.invoke(constructorRecord(), [receiver, first]), 0);
	assert.equal(fixture.heap.getField(receiver, JAVA_THROWABLE_MESSAGE_FIELD), first);
	assert.equal(fixture.heap.getField(receiver, JAVA_THROWABLE_CAUSE_FIELD), receiver);
	assert.equal(fixture.family.invoke(constructorRecord(), [receiver, second]), 0);
	assert.equal(fixture.heap.getField(receiver, JAVA_THROWABLE_MESSAGE_FIELD), second);
	assert.equal(fixture.heap.getField(receiver, JAVA_THROWABLE_CAUSE_FIELD), receiver);
});

test("RuntimeException String constructor accepts a null message", () => {
	const fixture = createFixture();
	const receiver = fixture.heap.allocate(RUNTIME_EXCEPTION);
	assert.equal(fixture.family.invoke(constructorRecord(), [receiver, 0]), 0);
	assert.equal(fixture.heap.getField(receiver, JAVA_THROWABLE_MESSAGE_FIELD), 0);
	assert.equal(fixture.heap.getField(receiver, JAVA_THROWABLE_CAUSE_FIELD), receiver);
});

test("RuntimeException constructor rejects forged receiver and message values", () => {
	const fixture = createFixture();
	const receiver = fixture.heap.allocate(RUNTIME_EXCEPTION);
	for (const invalid of [0, fixture.heap.allocate(OBJECT)]) {
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
		() => fixture.family.invoke(getMessage, [fixture.heap.allocate(RUNTIME_EXCEPTION)]),
		error => error.code === "ANDROID_JAVA_RUNTIME_EXCEPTION_METHOD_UNSUPPORTED"
	);
	const families = createFrameworkJavaValueFamilies(fixture.runtime);
	assert.equal(families.filter(family => family.canHandle(constructorRecord())).length, 1);
	assert.equal(families.filter(family => family.canHandle(getMessage)).length, 0);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap, registry: {} };
	return {
		family: createFrameworkJavaRuntimeExceptionMethods(runtime),
		heap,
		runtime
	};
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
