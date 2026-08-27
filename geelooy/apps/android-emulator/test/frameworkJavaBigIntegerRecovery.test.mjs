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
import { createGuestString, readGuestText } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves the recovered unbounded arithmetic surface. The Awtsmoos recreates
 * decimal, magnitude, quotient, bit road, and textual witness anew;
 * Awtsmoos.com keeps every result exact beyond the finite host Number vessel.
 */
test("BigInteger constructors preserve text, radix, and sign-magnitude", () => {
	const fixture = createFixture();
	const decimal = fixture.construct(
		"(Ljava/lang/String;)V",
		[createGuestString(fixture.runtime, "12345678901234567890")]
	);
	assert.equal(readJavaBigInteger(fixture.runtime, decimal), 12345678901234567890n);
	const radix = fixture.construct(
		"(Ljava/lang/String;I)V",
		[createGuestString(fixture.runtime, "ff"), 16]
	);
	assert.equal(readJavaBigInteger(fixture.runtime, radix), 255n);
	const bytes = fixture.heap.allocateArray("[B", 2);
	fixture.heap.arraySet(bytes, 0, 1);
	fixture.heap.arraySet(bytes, 1, 0);
	const magnitude = fixture.construct("(I[B)V", [-1, bytes]);
	assert.equal(readJavaBigInteger(fixture.runtime, magnitude), -256n);
});

test("BigInteger arithmetic, comparison, bits, and text remain exact", () => {
	const fixture = createFixture();
	const left = fixture.valueOf(0x10000000000000000n);
	const right = fixture.valueOf(3n);
	assert.equal(fixture.read(fixture.call("add", "(Ljava/math/BigInteger;)Ljava/math/BigInteger;", [left, right])), 0x10000000000000003n);
	assert.equal(fixture.read(fixture.call("multiply", "(Ljava/math/BigInteger;)Ljava/math/BigInteger;", [right, right])), 9n);
	assert.equal(fixture.read(fixture.call("divide", "(Ljava/math/BigInteger;)Ljava/math/BigInteger;", [left, right])), 6148914691236517205n);
	assert.equal(fixture.read(fixture.call("or", "(Ljava/math/BigInteger;)Ljava/math/BigInteger;", [left, right])), 0x10000000000000003n);
	assert.equal(fixture.read(fixture.call("shiftLeft", "(I)Ljava/math/BigInteger;", [right, 4])), 48n);
	assert.equal(fixture.read(fixture.call("negate", "()Ljava/math/BigInteger;", [right])), -3n);
	assert.equal(fixture.call("compareTo", "(Ljava/math/BigInteger;)I", [left, right]), 1);
	assert.equal(fixture.call("equals", "(Ljava/lang/Object;)Z", [right, fixture.valueOf(3n)]), 1);
	assert.equal(fixture.call("bitLength", "()I", [left]), 65);
	assert.equal(fixture.call("longValue", "()J", [left]), 0n);
	const text = fixture.call("toString", "(I)Ljava/lang/String;", [left, 16]);
	assert.equal(readGuestText(fixture.runtime, text), "10000000000000000");
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const family = createFrameworkJavaBigIntegerMethods(runtime);
	const call = (name, descriptor, args) => family.invoke(record(name, descriptor), args);
	return {
		call,
		construct(descriptor, args) {
			const reference = heap.allocate(JAVA_BIG_INTEGER);
			call("<init>", descriptor, [reference, ...args]);
			return reference;
		},
		family,
		heap,
		read(reference) {
			return readJavaBigInteger(runtime, reference);
		},
		runtime,
		valueOf(value) {
			return call("valueOf", "(J)Ljava/math/BigInteger;", [value]);
		}
	};
}

function record(name, descriptor) {
	return {
		method: { classType: JAVA_BIG_INTEGER, descriptor, name },
		signature: `${JAVA_BIG_INTEGER}->${name}${descriptor}`
	};
}
