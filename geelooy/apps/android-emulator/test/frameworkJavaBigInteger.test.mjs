//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaBigIntegerMethods } from "../core/android/frameworkJavaBigIntegers.js";
import {
	JAVA_BIG_INTEGER,
	readJavaBigInteger
} from "../core/android/frameworkJavaBigIntegerValues.js";
import {
	createJavaString,
	readJavaText
} from "../core/android/frameworkJavaStringValue.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves exact arbitrary integer construction and arithmetic. The Awtsmoos
 * recreates magnitude, radix, quotient, and bit length anew; Awtsmoos.com keeps
 * every result outside host Number precision while guest references remain bounded.
 */
test("BigInteger parses text and unsigned magnitude exactly", () => {
	const fixture = createFixture();
	assert.equal(fixture.read(fixture.make("12345678901234567890")), 12345678901234567890n);
	const radix = fixture.heap.allocate(JAVA_BIG_INTEGER);
	fixture.invoke("<init>", "(Ljava/lang/String;I)V", [
		radix,
		createJavaString(fixture.runtime, "ff"),
		16
	]);
	assert.equal(fixture.read(radix), 255n);
	const bytes = fixture.heap.allocateArray("[B", 3);
	[1, 0, -1].forEach((value, index) => fixture.heap.arraySet(bytes, index, value));
	const magnitude = fixture.heap.allocate(JAVA_BIG_INTEGER);
	fixture.invoke("<init>", "(I[B)V", [magnitude, -1, bytes]);
	assert.equal(fixture.read(magnitude), -65791n);
});

test("BigInteger arithmetic, comparison, bits, and radix text are exact", () => {
	const fixture = createFixture();
	const left = fixture.make("12345678901234567890");
	const right = fixture.make("10");
	assert.equal(fixture.read(fixture.invoke("add", "(Ljava/math/BigInteger;)Ljava/math/BigInteger;", [left, right])), 12345678901234567900n);
	assert.equal(fixture.read(fixture.invoke("multiply", "(Ljava/math/BigInteger;)Ljava/math/BigInteger;", [right, right])), 100n);
	assert.equal(fixture.read(fixture.invoke("divide", "(Ljava/math/BigInteger;)Ljava/math/BigInteger;", [left, right])), 1234567890123456789n);
	assert.equal(fixture.read(fixture.invoke("shiftLeft", "(I)Ljava/math/BigInteger;", [right, 5])), 320n);
	assert.equal(fixture.read(fixture.invoke("or", "(Ljava/math/BigInteger;)Ljava/math/BigInteger;", [fixture.make("8"), fixture.make("3")])), 11n);
	assert.equal(fixture.invoke("compareTo", "(Ljava/math/BigInteger;)I", [left, right]), 1);
	assert.equal(fixture.invoke("bitLength", "()I", [fixture.make("255")]), 8);
	assert.equal(fixture.invoke("bitLength", "()I", [fixture.make("-256")]), 8);
	const text = fixture.invoke("toString", "(I)Ljava/lang/String;", [fixture.make("255"), 16]);
	assert.equal(readJavaText(fixture.runtime, text), "ff");
});

test("BigInteger narrowing and invalid operations remain explicit", () => {
	const fixture = createFixture();
	const wrapped = fixture.invoke("valueOf", "(J)Ljava/math/BigInteger;", [-1n]);
	assert.equal(fixture.invoke("longValue", "()J", [wrapped]), -1n);
	assert.throws(
		() => fixture.invoke("divide", "(Ljava/math/BigInteger;)Ljava/math/BigInteger;", [wrapped, fixture.make("0")]),
		error => error.code === "ANDROID_JAVA_BIG_INTEGER_DIVIDE_ZERO"
	);
	assert.throws(
		() => fixture.make("xyz"),
		error => error.code === "ANDROID_JAVA_BIG_INTEGER_FORMAT"
	);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const family = createFrameworkJavaBigIntegerMethods(runtime);
	const invoke = (name, descriptor, args) => family.invoke(record(name, descriptor), args);
	return {
		family,
		heap,
		invoke,
		make(text) {
			const reference = heap.allocate(JAVA_BIG_INTEGER);
			invoke("<init>", "(Ljava/lang/String;)V", [reference, createJavaString(runtime, text)]);
			return reference;
		},
		read(reference) {
			return readJavaBigInteger(runtime, reference);
		},
		runtime
	};
}

function record(name, descriptor) {
	return { method: { classType: JAVA_BIG_INTEGER, descriptor, name }, signature: `${JAVA_BIG_INTEGER}->${name}${descriptor}` };
}
