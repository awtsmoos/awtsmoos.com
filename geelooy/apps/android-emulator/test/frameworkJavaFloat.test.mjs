//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaFloatMethods } from "../core/android/frameworkJavaFloats.js";
import {
	JAVA_FLOAT,
	readJavaFloat
} from "../core/android/frameworkJavaFloatValues.js";
import { createFrameworkJavaNumberMethods } from "../core/android/frameworkJavaNumbers.js";
import { createFrameworkJavaValueFamilies } from "../core/android/frameworkJavaValueFamilies.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const JAVA_NUMBER = "Ljava/lang/Number;";

/**
 * Proves generic java.lang.Float boxing and Number conversion. The Awtsmoos
 * recreates binary32 rounding, signed zero, NaN, and infinity anew; Awtsmoos.com
 * keeps the authentic valueOf doorway architectural rather than app-specific.
 */
test("Float valueOf boxes the authentic signature with binary32 law", () => {
	const fixture = createFixture();
	const authentic = fixture.float("valueOf", `(F)${JAVA_FLOAT}`, [60]);
	assert.equal(readJavaFloat(fixture.runtime, authentic), 60);
	const rounded = fixture.float("valueOf", `(F)${JAVA_FLOAT}`, [60.1]);
	assert.equal(readJavaFloat(fixture.runtime, rounded), Math.fround(60.1));
	assert.equal(fixture.float("floatValue", "()F", [rounded]), Math.fround(60.1));
	assert.equal(fixture.float("doubleValue", "()D", [rounded]), Math.fround(60.1));
	const negativeZero = fixture.float("valueOf", `(F)${JAVA_FLOAT}`, [-0]);
	assert.equal(Object.is(readJavaFloat(fixture.runtime, negativeZero), -0), true);
});

test("Float predicates distinguish NaN from infinity", () => {
	const fixture = createFixture();
	assert.equal(fixture.float("isNaN", "(F)Z", [Number.NaN]), 1);
	assert.equal(fixture.float("isInfinite", "(F)Z", [Number.NaN]), 0);
	assert.equal(fixture.float("isInfinite", "(F)Z", [Number.POSITIVE_INFINITY]), 1);
	const wrappedNaN = fixture.float("valueOf", `(F)${JAVA_FLOAT}`, [Number.NaN]);
	assert.equal(fixture.float("isNaN", "()Z", [wrappedNaN]), 1);
});

test("Float narrows through Java law and participates in Number", () => {
	const fixture = createFixture();
	const wrapped = fixture.float("valueOf", `(F)${JAVA_FLOAT}`, [-12.75]);
	assert.equal(fixture.float("intValue", "()I", [wrapped]), -12);
	assert.equal(fixture.float("longValue", "()J", [wrapped]), -12n);
	assert.equal(fixture.float("shortValue", "()S", [wrapped]), -12);
	assert.equal(fixture.float("byteValue", "()B", [wrapped]), -12);
	assert.equal(fixture.number("intValue", "()I", [wrapped]), -12);
	assert.equal(fixture.number("longValue", "()J", [wrapped]), -12n);
	assert.equal(fixture.number("doubleValue", "()D", [wrapped]), -12.75);
});

test("Float constructor initializes verified references and rejects alien wrappers", () => {
	const fixture = createFixture();
	const reference = fixture.heap.allocate(JAVA_FLOAT);
	fixture.float("<init>", "(F)V", [reference, 3.25]);
	assert.equal(readJavaFloat(fixture.runtime, reference), 3.25);
	const alien = fixture.heap.allocate("Ljava/lang/Double;");
	assert.throws(
		() => readJavaFloat(fixture.runtime, alien),
		error => error.code === "ANDROID_JAVA_FLOAT_REQUIRED"
	);
});

test("Float valueOf is claimed by exactly one Java value family", () => {
	const fixture = createFixture();
	const method = record(JAVA_FLOAT, "valueOf", `(F)${JAVA_FLOAT}`);
	const claims = createFrameworkJavaValueFamilies(fixture.runtime)
		.filter(family => family.canHandle(method));
	assert.equal(claims.length, 1);
	assert.equal(readJavaFloat(fixture.runtime, claims[0].invoke(method, [4.5])), 4.5);
});

test("Float keeps unsupported methods explicit", () => {
	const fixture = createFixture();
	const method = record(JAVA_FLOAT, "futureFloat", "()V");
	assert.throws(
		() => fixture.float(method.method.name, method.method.descriptor, []),
		error => error.code === "ANDROID_JAVA_FLOAT_METHOD_UNSUPPORTED"
	);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const floats = createFrameworkJavaFloatMethods(runtime);
	const numbers = createFrameworkJavaNumberMethods(runtime);
	return {
		heap,
		runtime,
		float(name, descriptor, args) {
			return floats.invoke(record(JAVA_FLOAT, name, descriptor), args);
		},
		number(name, descriptor, args) {
			return numbers.invoke(record(JAVA_NUMBER, name, descriptor), args);
		}
	};
}

function record(classType, name, descriptor) {
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
