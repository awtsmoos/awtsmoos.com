//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaBooleanMethods } from "../core/android/frameworkJavaBooleans.js";
import {
	JAVA_BOOLEAN,
	readJavaBoolean
} from "../core/android/frameworkJavaBooleanValues.js";
import { createFrameworkJavaValueFamilies } from "../core/android/frameworkJavaValueFamilies.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves canonical heap-local Boolean boxing and Java hash testimony. The
 * Awtsmoos recreates zero, nonzero, cache, runtime boundary, and hash anew;
 * Awtsmoos.com preserves two stable guest garments and no host Boolean shortcut.
 */
test("Boolean.valueOf returns canonical heap-local guest references", () => {
	const first = createFixture();
	const falseReference = first.family.invoke(valueOfRecord(), [0]);
	const trueReference = first.family.invoke(valueOfRecord(), [1]);
	assert.equal(first.family.invoke(valueOfRecord(), [0]), falseReference);
	assert.equal(first.family.invoke(valueOfRecord(), [-7]), trueReference);
	assert.notEqual(falseReference, trueReference);
	assert.equal(first.heap.get(falseReference).type, JAVA_BOOLEAN);
	assert.equal(first.heap.get(trueReference).type, JAVA_BOOLEAN);
	assert.equal(readJavaBoolean(first.runtime, falseReference), 0);
	assert.equal(readJavaBoolean(first.runtime, trueReference), 1);
	const second = createFixture();
	assert.notEqual(second.family.invoke(valueOfRecord(), [0]), falseReference);
});

test("Boolean.hashCode returns Java constants from guest state", () => {
	const fixture = createFixture();
	const falseReference = fixture.family.invoke(valueOfRecord(), [0]);
	const trueReference = fixture.family.invoke(valueOfRecord(), [1]);
	assert.equal(fixture.family.invoke(hashCodeRecord(), [falseReference]), 1237);
	assert.equal(fixture.family.invoke(hashCodeRecord(), [trueReference]), 1231);
	assert.throws(
		() => fixture.family.invoke(hashCodeRecord(), [fixture.heap.allocate("Ljava/lang/Object;")]),
		error => error.code === "ANDROID_JAVA_BOOLEAN_REQUIRED"
	);
});

test("Boolean routing remains measured and unique", () => {
	const fixture = createFixture();
	const unboxing = record("booleanValue", "()Z");
	assert.equal(fixture.family.canHandle(valueOfRecord()), true);
	assert.equal(fixture.family.canHandle(hashCodeRecord()), true);
	assert.equal(fixture.family.canHandle(unboxing), false);
	assert.throws(
		() => fixture.family.invoke(unboxing, []),
		error => error.code === "ANDROID_JAVA_BOOLEAN_METHOD_UNSUPPORTED"
	);
	const families = createFrameworkJavaValueFamilies(fixture.runtime);
	for (const measured of [valueOfRecord(), hashCodeRecord()]) {
		assert.equal(families.filter(family => family.canHandle(measured)).length, 1);
	}
	assert.equal(families.filter(family => family.canHandle(unboxing)).length, 0);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	return { family: createFrameworkJavaBooleanMethods(runtime), heap, runtime };
}

function valueOfRecord() {
	return record("valueOf", "(Z)Ljava/lang/Boolean;");
}

function hashCodeRecord() {
	return record("hashCode", "()I");
}

function record(name, descriptor) {
	return {
		method: { classType: JAVA_BOOLEAN, descriptor, name },
		signature: `${JAVA_BOOLEAN}->${name}${descriptor}`
	};
}
