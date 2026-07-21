//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaNumberMethods } from "../core/android/frameworkJavaNumbers.js";
import { createFrameworkJavaShortMethods } from "../core/android/frameworkJavaShorts.js";
import {
	createJavaBigInteger
} from "../core/android/frameworkJavaBigIntegerValues.js";
import { createJavaDouble } from "../core/android/frameworkJavaDoubleValues.js";
import {
	initializeJavaInteger,
	JAVA_INTEGER
} from "../core/android/frameworkJavaIntegerValues.js";
import {
	initializeJavaLong,
	JAVA_LONG
} from "../core/android/frameworkJavaLongValues.js";
import {
	createJavaShort,
	JAVA_SHORT,
	readJavaShort
} from "../core/android/frameworkJavaShortValues.js";
import { createGuestString } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const JAVA_NUMBER = "Ljava/lang/Number;";

/**
 * Proves signed Short decoding and abstract Number conversion. The Awtsmoos
 * recreates radix, wrapper, widening, narrowing, and rejection anew;
 * Awtsmoos.com refuses unknown numeric garments instead of inventing zero.
 */
test("Short valueOf, decode, and narrowing preserve signed sixteen-bit law", () => {
	const fixture = createFixture();
	const boxed = fixture.shorts.invoke(shortRecord("valueOf", "(S)Ljava/lang/Short;"), [65535]);
	assert.equal(readJavaShort(fixture.runtime, boxed), -1);
	for (const [text, expected] of [["#7fff", 32767], ["077", 63], ["-0x80", -128]]) {
		const decoded = fixture.shorts.invoke(
			shortRecord("decode", "(Ljava/lang/String;)Ljava/lang/Short;"),
			[createGuestString(fixture.runtime, text)]
		);
		assert.equal(readJavaShort(fixture.runtime, decoded), expected);
	}
	assert.equal(fixture.shorts.invoke(shortRecord("byteValue", "()B"), [boxed]), -1);
	assert.throws(
		() => fixture.shorts.invoke(
			shortRecord("decode", "(Ljava/lang/String;)Ljava/lang/Short;"),
			[createGuestString(fixture.runtime, "40000")]
		),
		error => error.code === "ANDROID_JAVA_SHORT_OVERFLOW"
	);
});

test("Number conversions read every supported wrapper and reject strangers", () => {
	const fixture = createFixture();
	const integer = fixture.heap.allocate(JAVA_INTEGER);
	initializeJavaInteger(fixture.runtime, integer, -17);
	const long = fixture.heap.allocate(JAVA_LONG);
	initializeJavaLong(fixture.runtime, long, 0x100000002n);
	const double = createJavaDouble(fixture.runtime, 9.75);
	const short = createJavaShort(fixture.runtime, -9);
	const big = createJavaBigInteger(fixture.runtime, 0x100000003n);
	assert.equal(fixture.number("intValue", "()I", integer), -17);
	assert.equal(fixture.number("intValue", "()I", long), 2);
	assert.equal(fixture.number("longValue", "()J", big), 0x100000003n);
	assert.equal(fixture.number("doubleValue", "()D", double), 9.75);
	assert.equal(fixture.number("floatValue", "()F", short), -9);
	const stranger = fixture.heap.allocate("Ljava/lang/Object;");
	assert.throws(
		() => fixture.number("intValue", "()I", stranger),
		error => error.code === "ANDROID_JAVA_NUMBER_REQUIRED"
	);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const numbers = createFrameworkJavaNumberMethods(runtime);
	return {
		heap,
		number(name, descriptor, receiver) {
			return numbers.invoke(numberRecord(name, descriptor), [receiver]);
		},
		runtime,
		shorts: createFrameworkJavaShortMethods(runtime)
	};
}

function numberRecord(name, descriptor) {
	return record(JAVA_NUMBER, name, descriptor);
}

function shortRecord(name, descriptor) {
	return record(JAVA_SHORT, name, descriptor);
}

function record(classType, name, descriptor) {
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
