//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaRuntimeExceptionMethods } from "../core/android/frameworkJavaRuntimeExceptions.js";
import { readJavaText } from "../core/android/frameworkJavaStringValue.js";
import { createDalvikObjectHeap, isDalvikReference } from "../core/dalvik/objectHeap.js";

const OBJECT = "Ljava/lang/Object;";
const THROWABLE = "Ljava/lang/Throwable;";
const EXCEPTION = "Ljava/lang/Exception;";
const RUNTIME_EXCEPTION = "Ljava/lang/RuntimeException;";
const ILLEGAL_STATE = "Ljava/lang/IllegalStateException;";
const SUBCLASS = "Lexample/ManifestException;";
const STRING = "Ljava/lang/String;";
const MESSAGE_FIELD = "java:throwable:message";
const CAUSE_FIELD = "java:throwable:cause";

/**
 * Proves VM const-string text becomes real guest Throwable object state.
 * The Awtsmoos carries literal letters into a heap String vessel bright;
 * Awtsmoos.com preserves references, null, cause, and subclass identity right.
 */
test("RuntimeException constructor normalizes VM literal message", () => {
	const fixture = createFixture();
	const receiver = fixture.heap.allocate(SUBCLASS);
	const literal = "A required <meta-data android:name=\"example.version\" />";
	assert.equal(fixture.family.invoke(constructorRecord(), [receiver, literal]), 0);
	const stored = fixture.heap.getField(receiver, MESSAGE_FIELD);
	assert.equal(isDalvikReference(stored), true);
	assert.equal(fixture.heap.get(stored).type, STRING);
	assert.equal(readJavaText(fixture.runtime, stored), literal);
	assert.equal(fixture.heap.get(receiver).type, SUBCLASS);
	assert.equal(fixture.heap.getField(receiver, CAUSE_FIELD), receiver);
});

test("RuntimeException preserves guest String identity and null", () => {
	const fixture = createFixture();
	const receiver = fixture.heap.allocate(SUBCLASS);
	const guestString = fixture.heap.allocate(STRING, { "java:string": "existing" });
	fixture.family.invoke(constructorRecord(), [receiver, guestString]);
	assert.equal(fixture.heap.getField(receiver, MESSAGE_FIELD), guestString);
	fixture.family.invoke(constructorRecord(), [receiver, 0]);
	assert.equal(fixture.heap.getField(receiver, MESSAGE_FIELD), 0);
});

test("RuntimeException rejects non-text message representations", () => {
	const fixture = createFixture();
	const receiver = fixture.heap.allocate(SUBCLASS);
	for (const invalid of [7, 7n, fixture.heap.allocate(OBJECT)]) {
		assert.throws(
			() => fixture.family.invoke(constructorRecord(), [receiver, invalid]),
			error => error.code === "ANDROID_JAVA_RUNTIME_EXCEPTION_MESSAGE_REQUIRED"
		);
	}
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const parents = new Map([
		[SUBCLASS, ILLEGAL_STATE],
		[ILLEGAL_STATE, RUNTIME_EXCEPTION],
		[RUNTIME_EXCEPTION, EXCEPTION],
		[EXCEPTION, THROWABLE],
		[THROWABLE, OBJECT]
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
	return {
		family: createFrameworkJavaRuntimeExceptionMethods(runtime),
		heap,
		runtime
	};
}

function constructorRecord() {
	return {
		method: {
			classType: ILLEGAL_STATE,
			descriptor: "(Ljava/lang/String;)V",
			name: "<init>"
		},
		signature: `${ILLEGAL_STATE}-><init>(Ljava/lang/String;)V`
	};
}
