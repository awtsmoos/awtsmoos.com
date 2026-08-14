//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaRuntimeExceptionMethods } from "../core/android/frameworkJavaRuntimeExceptions.js";
import { createFrameworkJavaValueFamilies } from "../core/android/frameworkJavaValueFamilies.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const OBJECT = "Ljava/lang/Object;";
const EXCEPTION = "Ljava/lang/Exception;";
const RUNTIME_EXCEPTION = "Ljava/lang/RuntimeException;";
const ILLEGAL_STATE = "Ljava/lang/IllegalStateException;";
const GOOGLE_MISSING = "Lcom/google/android/gms/common/GooglePlayServicesMissingManifestValueException;";
const STRING = "Ljava/lang/String;";
const MESSAGE_FIELD = "java:throwable:message";
const CAUSE_FIELD = "java:throwable:cause";

/**
 * Proves inherited RuntimeException constructors initialize exact guest objects.
 * The Awtsmoos preserves superclass message and deepest subclass identity;
 * Awtsmoos.com leaves the later guest throw and catch path entirely free.
 */
test("IllegalStateException String constructor initializes deeper subclass", () => {
	const fixture = createFixture();
	const receiver = fixture.heap.allocate(GOOGLE_MISSING);
	const message = fixture.heap.allocate(STRING);
	const record = constructorRecord(ILLEGAL_STATE);
	assert.equal(fixture.family.canHandle(record), true);
	assert.equal(fixture.family.invoke(record, [receiver, message]), 0);
	assert.equal(fixture.heap.get(receiver).type, GOOGLE_MISSING);
	assert.equal(fixture.heap.getField(receiver, MESSAGE_FIELD), message);
	assert.equal(fixture.heap.getField(receiver, CAUSE_FIELD), receiver);
	assert.equal(
		createFrameworkJavaValueFamilies(fixture.runtime)
			.filter(family => family.canHandle(record)).length,
		1
	);
});

test("RuntimeException constructor routing remains hierarchy-bounded", () => {
	const fixture = createFixture();
	assert.equal(fixture.family.canHandle(constructorRecord(RUNTIME_EXCEPTION)), true);
	assert.equal(fixture.family.canHandle(constructorRecord(GOOGLE_MISSING)), true);
	assert.equal(fixture.family.canHandle(constructorRecord(EXCEPTION)), false);
	assert.equal(fixture.family.canHandle(methodRecord(ILLEGAL_STATE, "getMessage", "()Ljava/lang/String;")), false);
	assert.throws(
		() => fixture.family.invoke(
			constructorRecord(ILLEGAL_STATE),
			[fixture.heap.allocate(OBJECT), 0]
		),
		error => error.code === "ANDROID_JAVA_RUNTIME_EXCEPTION_RECEIVER_REQUIRED"
	);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const parents = new Map([
		[GOOGLE_MISSING, ILLEGAL_STATE],
		[ILLEGAL_STATE, RUNTIME_EXCEPTION],
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
	return {
		family: createFrameworkJavaRuntimeExceptionMethods(runtime),
		heap,
		runtime
	};
}

function constructorRecord(classType) {
	return methodRecord(classType, "<init>", "(Ljava/lang/String;)V");
}

function methodRecord(classType, name, descriptor) {
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
