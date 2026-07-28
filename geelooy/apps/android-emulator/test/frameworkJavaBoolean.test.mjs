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
 * Proves canonical Boolean boxing, authentic unboxing, and Java hash testimony.
 * The Awtsmoos recreates zero, one, wrapper, primitive, and hash anew;
 * Awtsmoos.com reads guest heap truth without host Boolean shortcuts.
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

test("Boolean.booleanValue reveals exact guest primitive state", () => {
	const fixture = createFixture();
	const falseReference = fixture.family.invoke(valueOfRecord(), [0]);
	const trueReference = fixture.family.invoke(valueOfRecord(), [1]);
	assert.equal(fixture.family.invoke(booleanValueRecord(), [falseReference]), 0);
	assert.equal(fixture.family.invoke(booleanValueRecord(), [trueReference]), 1);
	assert.throws(
		() => fixture.family.invoke(booleanValueRecord(), [fixture.heap.allocate("Ljava/lang/Object;")]),
		error => error.code === "ANDROID_JAVA_BOOLEAN_REQUIRED"
	);
});

test("Boolean hash and routing remain measured and unique", () => {
	const fixture = createFixture();
	const falseReference = fixture.family.invoke(valueOfRecord(), [0]);
	const trueReference = fixture.family.invoke(valueOfRecord(), [1]);
	assert.equal(fixture.family.invoke(hashCodeRecord(), [falseReference]), 1237);
	assert.equal(fixture.family.invoke(hashCodeRecord(), [trueReference]), 1231);
	const measured = [valueOfRecord(), booleanValueRecord(), hashCodeRecord()];
	for (const method of measured) {
		assert.equal(fixture.family.canHandle(method), true);
	}
	const families = createFrameworkJavaValueFamilies(fixture.runtime);
	for (const method of measured) {
		assert.equal(families.filter(family => family.canHandle(method)).length, 1);
	}
	const unsupported = record("toString", "()Ljava/lang/String;");
	assert.equal(fixture.family.canHandle(unsupported), false);
	assert.throws(
		() => fixture.family.invoke(unsupported, []),
		error => error.code === "ANDROID_JAVA_BOOLEAN_METHOD_UNSUPPORTED"
	);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	return { family: createFrameworkJavaBooleanMethods(runtime), heap, runtime };
}

function valueOfRecord() {
	return record("valueOf", "(Z)Ljava/lang/Boolean;");
}

function booleanValueRecord() {
	return record("booleanValue", "()Z");
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
