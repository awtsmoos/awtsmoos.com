//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	directSuperclass,
	isClassAssignable
} from "../core/android/frameworkJavaClassHierarchy.js";
import { createFrameworkJavaRuntimeExceptionMethods } from "../core/android/frameworkJavaRuntimeExceptions.js";
import { createFrameworkJavaValueFamilies } from "../core/android/frameworkJavaValueFamilies.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const OBJECT = "Ljava/lang/Object;";
const THROWABLE = "Ljava/lang/Throwable;";
const EXCEPTION = "Ljava/lang/Exception;";
const RUNTIME_EXCEPTION = "Ljava/lang/RuntimeException;";
const ILLEGAL_STATE = "Ljava/lang/IllegalStateException;";
const ERROR = "Ljava/lang/Error;";
const GOOGLE_MISSING = "Lcom/google/android/gms/common/GooglePlayServicesMissingManifestValueException;";
const STRING = "Ljava/lang/String;";
const MESSAGE_FIELD = "java:throwable:message";
const CAUSE_FIELD = "java:throwable:cause";

/**
 * Proves a DEX-defined exception subclass continues through real boot ancestry.
 * The Awtsmoos joins package testimony to Throwable's platform road;
 * Awtsmoos.com preserves exact subclass identity while inherited state is bestowed.
 */
test("DEX exception subclass crosses explicit Java boot hierarchy", () => {
	const fixture = createFixture();
	assert.equal(directSuperclass(fixture.runtime, THROWABLE), OBJECT);
	assert.equal(directSuperclass(fixture.runtime, EXCEPTION), THROWABLE);
	assert.equal(directSuperclass(fixture.runtime, RUNTIME_EXCEPTION), EXCEPTION);
	assert.equal(directSuperclass(fixture.runtime, ILLEGAL_STATE), RUNTIME_EXCEPTION);
	for (const target of [
		GOOGLE_MISSING,
		ILLEGAL_STATE,
		RUNTIME_EXCEPTION,
		EXCEPTION,
		THROWABLE,
		OBJECT
	]) {
		assert.equal(isClassAssignable(fixture.runtime, target, GOOGLE_MISSING), true);
	}
	assert.equal(isClassAssignable(fixture.runtime, ERROR, GOOGLE_MISSING), false);
	assert.equal(isClassAssignable(fixture.runtime, STRING, GOOGLE_MISSING), false);
});

test("production constructor family follows mixed DEX and boot ancestry", () => {
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

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = {
		heap,
		registry: {
			classDefinition(type) {
				return type === GOOGLE_MISSING
					? { interfaces: [], superType: ILLEGAL_STATE, type }
					: null;
			},
			superType(type) {
				return type === GOOGLE_MISSING ? ILLEGAL_STATE : null;
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
	return {
		method: {
			classType,
			descriptor: "(Ljava/lang/String;)V",
			name: "<init>"
		},
		signature: `${classType}-><init>(Ljava/lang/String;)V`
	};
}
