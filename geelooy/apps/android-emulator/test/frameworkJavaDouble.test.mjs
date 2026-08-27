//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createGuestString, readGuestText } from "../core/android/guestText.js";
import {
	javaDoubleToLongBits
} from "../core/android/frameworkJavaDoubleBits.js";
import { createFrameworkJavaDoubleMethods } from "../core/android/frameworkJavaDoubles.js";
import {
	JAVA_DOUBLE,
	readJavaDouble
} from "../core/android/frameworkJavaDoubleValues.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves IEEE-754 boxing, comparison, text, and bit testimony. The Awtsmoos
 * recreates NaN, infinity, signed zero, and mantissa anew; Awtsmoos.com keeps
 * quiet payload witness exact while canonical Java equality remains explicit.
 */
test("Double boxes, parses, narrows, and formats measured values", () => {
	const fixture = createFixture();
	const boxed = fixture.invoke("valueOf", "(D)Ljava/lang/Double;", [12.75]);
	assert.equal(readJavaDouble(fixture.runtime, boxed), 12.75);
	assert.equal(fixture.invoke("doubleValue", "()D", [boxed]), 12.75);
	assert.equal(fixture.invoke("intValue", "()I", [boxed]), 12);
	const parsed = fixture.invoke("valueOf", "(Ljava/lang/String;)Ljava/lang/Double;", [
		createGuestString(fixture.runtime, "-0.0")
	]);
	assert.equal(Object.is(readJavaDouble(fixture.runtime, parsed), -0), true);
	const text = fixture.invoke("toString", "(D)Ljava/lang/String;", [1]);
	assert.equal(readGuestText(fixture.runtime, text), "1.0");
});

test("Double preserves Java NaN, infinity, and signed-zero laws", () => {
	const fixture = createFixture();
	assert.equal(fixture.invoke("compare", "(DD)I", [0, 0, -0]), 1);
	assert.equal(fixture.invoke("compare", "(DD)I", [Number.NaN, 0, 7]), 1);
	const firstNaN = fixture.invoke("valueOf", "(D)Ljava/lang/Double;", [Number.NaN]);
	const secondNaN = fixture.invoke("valueOf", "(D)Ljava/lang/Double;", [Number.NaN]);
	assert.equal(fixture.invoke("equals", "(Ljava/lang/Object;)Z", [firstNaN, secondNaN]), 1);
	assert.equal(fixture.invoke("isNaN", "()Z", [firstNaN]), 1);
	assert.equal(fixture.invoke("isInfinite", "(D)Z", [Number.POSITIVE_INFINITY]), 1);
	assert.equal(fixture.invoke("isInfinite", "(D)Z", [Number.NaN]), 0);
	assert.equal(
		fixture.invoke("hashCode", "()I", [firstNaN]),
		Number(BigInt.asIntN(32, 0x7ff8000000000000n ^ 0x7ff80000n))
	);
});

test("Double quiet NaN raw and canonical bits round-trip independently", () => {
	const fixture = createFixture();
	const rawNaN = 0x7ff8000000000001n;
	const value = fixture.invoke("longBitsToDouble", "(J)D", [rawNaN]);
	assert.equal(Number.isNaN(value), true);
	assert.equal(fixture.invoke("doubleToRawLongBits", "(D)J", [value]), rawNaN);
	assert.equal(
		fixture.invoke("doubleToLongBits", "(D)J", [value]),
		javaDoubleToLongBits(Number.NaN)
	);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const family = createFrameworkJavaDoubleMethods(runtime);
	return {
		invoke(name, descriptor, args) {
			return family.invoke(record(name, descriptor), args);
		},
		runtime
	};
}

function record(name, descriptor) {
	return {
		method: { classType: JAVA_DOUBLE, descriptor, name },
		signature: `${JAVA_DOUBLE}->${name}${descriptor}`
	};
}
