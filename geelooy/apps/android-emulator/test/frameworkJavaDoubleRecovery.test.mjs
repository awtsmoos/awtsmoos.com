//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaDoubleMethods } from "../core/android/frameworkJavaDoubles.js";
import {
	JAVA_DOUBLE,
	readJavaDouble
} from "../core/android/frameworkJavaDoubleValues.js";
import { createGuestString, readGuestText } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves the recovered IEEE-754 surface. The Awtsmoos recreates signed zero,
 * infinity, NaN payload, canonical bits, and decimal witness anew;
 * Awtsmoos.com preserves Java object law beyond ordinary numeric equality.
 */
test("Double boxing, parsing, classification, and text are Java-shaped", () => {
	const fixture = createFixture();
	const boxed = fixture.call("valueOf", "(D)Ljava/lang/Double;", [12.5]);
	assert.equal(readJavaDouble(fixture.runtime, boxed), 12.5);
	const text = createGuestString(fixture.runtime, "-3.25");
	assert.equal(fixture.call("parseDouble", "(Ljava/lang/String;)D", [text]), -3.25);
	assert.equal(fixture.call("isInfinite", "(D)Z", [Number.NaN]), 0);
	assert.equal(fixture.call("isInfinite", "(D)Z", [Number.POSITIVE_INFINITY]), 1);
	assert.equal(fixture.call("isNaN", "(D)Z", [Number.NaN]), 1);
	assert.equal(fixture.call("intValue", "()I", [boxed]), 12);
	const rendered = fixture.call("toString", "(D)Ljava/lang/String;", [-0]);
	assert.equal(readGuestText(fixture.runtime, rendered), "-0.0");
});

test("Double comparison, equality, and bit conversion preserve edge cases", () => {
	const fixture = createFixture();
	assert.equal(fixture.call("compare", "(DD)I", [-0, 0, +0, 0]), -1);
	assert.equal(fixture.call("compare", "(DD)I", [Number.NaN, 0, Infinity, 0]), 1);
	const quietPayload = 0x7ff8000000000001n;
	const nan = fixture.call("longBitsToDouble", "(J)D", [quietPayload]);
	assert.equal(Number.isNaN(nan), true);
	assert.equal(
		fixture.call("doubleToRawLongBits", "(D)J", [nan]),
		quietPayload
	);
	assert.equal(
		fixture.call("doubleToLongBits", "(D)J", [nan]),
		0x7ff8000000000000n
	);
	const firstNaN = fixture.call("valueOf", "(D)Ljava/lang/Double;", [nan]);
	const secondNaN = fixture.call("valueOf", "(D)Ljava/lang/Double;", [Number.NaN]);
	assert.equal(fixture.call("equals", "(Ljava/lang/Object;)Z", [firstNaN, secondNaN]), 1);
	const negativeZero = fixture.call("valueOf", "(D)Ljava/lang/Double;", [-0]);
	const positiveZero = fixture.call("valueOf", "(D)Ljava/lang/Double;", [+0]);
	assert.equal(fixture.call("equals", "(Ljava/lang/Object;)Z", [negativeZero, positiveZero]), 0);
	assert.equal(fixture.call("isNaN", "()Z", [firstNaN]), 1);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const family = createFrameworkJavaDoubleMethods(runtime);
	return {
		call(name, descriptor, args) {
			return family.invoke(record(name, descriptor), args);
		},
		heap,
		runtime
	};
}

function record(name, descriptor) {
	return {
		method: { classType: JAVA_DOUBLE, descriptor, name },
		signature: `${JAVA_DOUBLE}->${name}${descriptor}`
	};
}
