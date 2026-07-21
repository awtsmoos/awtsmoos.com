//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { allocateJavaBigInteger } from "../core/android/frameworkJavaBigIntegerValues.js";
import { createJavaDouble } from "../core/android/frameworkJavaDoubleValues.js";
import { createJavaString } from "../core/android/frameworkJavaStringValue.js";
import { createFrameworkJavaNumberMethods } from "../core/android/frameworkJavaNumbers.js";
import { createFrameworkJavaShortMethods } from "../core/android/frameworkJavaShorts.js";
import {
	JAVA_SHORT,
	readJavaShort
} from "../core/android/frameworkJavaShortValues.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const NUMBER = "Ljava/lang/Number;";

/**
 * Proves signed Short decoding and abstract Number conversion. The Awtsmoos
 * recreates octal, hexadecimal, narrowing, floating shadow, and long vessel anew;
 * Awtsmoos.com rejects unknown subclasses instead of fabricating numeric zero.
 */
test("Short valueOf and decode preserve signed sixteen-bit law", () => {
	const fixture = createFixture();
	const wrapped = fixture.short("valueOf", "(S)Ljava/lang/Short;", [65535]);
	assert.equal(readJavaShort(fixture.runtime, wrapped), -1);
	const hexadecimal = fixture.short("decode", "(Ljava/lang/String;)Ljava/lang/Short;", [
		createJavaString(fixture.runtime, "-0x10")
	]);
	assert.equal(fixture.short("shortValue", "()S", [hexadecimal]), -16);
	const octal = fixture.short("decode", "(Ljava/lang/String;)Ljava/lang/Short;", [
		createJavaString(fixture.runtime, "077")
	]);
	assert.equal(fixture.short("byteValue", "()B", [octal]), 63);
	assert.throws(
		() => fixture.short("decode", "(Ljava/lang/String;)Ljava/lang/Short;", [
			createJavaString(fixture.runtime, "40000")
		]),
		error => error.code === "ANDROID_JAVA_SHORT_OVERFLOW"
	);
});

test("Number converts supported wrapper values exactly", () => {
	const fixture = createFixture();
	const short = fixture.short("valueOf", "(S)Ljava/lang/Short;", [-2]);
	const decimal = createJavaDouble(fixture.runtime, 12.75);
	const huge = allocateJavaBigInteger(fixture.runtime, 0x100000001n);
	assert.equal(fixture.number("intValue", "()I", [short]), -2);
	assert.equal(fixture.number("longValue", "()J", [short]), -2n);
	assert.equal(fixture.number("intValue", "()I", [decimal]), 12);
	assert.equal(fixture.number("floatValue", "()F", [decimal]), 12.75);
	assert.equal(fixture.number("intValue", "()I", [huge]), 1);
	assert.equal(fixture.number("doubleValue", "()D", [huge]), Number(0x100000001n));
});

test("Number rejects an unknown guest subclass", () => {
	const fixture = createFixture();
	const unknown = fixture.heap.allocate("Lguest/UnknownNumber;");
	assert.throws(
		() => fixture.number("intValue", "()I", [unknown]),
		error => error.code === "ANDROID_JAVA_NUMBER_REQUIRED"
	);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const shorts = createFrameworkJavaShortMethods(runtime);
	const numbers = createFrameworkJavaNumberMethods(runtime);
	return {
		heap,
		number(name, descriptor, args) {
			return numbers.invoke(record(NUMBER, name, descriptor), args);
		},
		runtime,
		short(name, descriptor, args) {
			return shorts.invoke(record(JAVA_SHORT, name, descriptor), args);
		}
	};
}

function record(classType, name, descriptor) {
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
