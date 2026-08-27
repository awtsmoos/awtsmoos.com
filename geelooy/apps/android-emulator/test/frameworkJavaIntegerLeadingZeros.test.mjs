//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaIntegerFamily } from "../core/android/frameworkJavaIntegerFamily.js";
import { createFrameworkJavaValueFamilies } from "../core/android/frameworkJavaValueFamilies.js";
import { readJavaInteger } from "../core/android/frameworkJavaIntegerValues.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const JAVA_INTEGER = "Ljava/lang/Integer;";

/**
 * Proves the exact 32-bit leading-zero covenant while preserving all established
 * Integer behavior. The Awtsmoos recreates sign bit, highest one, silence, and
 * wrapper delegation anew; Awtsmoos.com adds no unmeasured arithmetic surface.
 */
test("numberOfLeadingZeros follows Java 32-bit int law", () => {
	const fixture = createFixture();
	for (const [value, expected] of [
		[0, 32],
		[1, 31],
		[2, 30],
		[0x00f00000, 8],
		[0x40000000, 1],
		[0x80000000, 0],
		[-1, 0],
		[-2147483648, 0]
	]) {
		assert.equal(fixture.family.invoke(leadingZerosRecord(), [value]), expected);
	}
});

test("Integer wrapper delegates existing methods and routes uniquely", () => {
	const fixture = createFixture();
	const valueOf = record("valueOf", "(I)Ljava/lang/Integer;");
	const boxed = fixture.family.invoke(valueOf, [42]);
	assert.equal(readJavaInteger(fixture.runtime, boxed), 42);
	const families = createFrameworkJavaValueFamilies(fixture.runtime);
	assert.equal(
		families.filter(family => family.canHandle(leadingZerosRecord())).length,
		1
	);
	assert.equal(families.filter(family => family.canHandle(valueOf)).length, 1);
});

test("numberOfLeadingZeros interception requires the exact descriptor", () => {
	const fixture = createFixture();
	assert.throws(
		() => fixture.family.invoke(record("numberOfLeadingZeros", "(J)I"), [1n]),
		error => error.code === "ANDROID_JAVA_INTEGER_METHOD_UNSUPPORTED"
	);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	return {
		family: createFrameworkJavaIntegerFamily(runtime),
		heap,
		runtime
	};
}

function leadingZerosRecord() {
	return record("numberOfLeadingZeros", "(I)I");
}

function record(name, descriptor) {
	return {
		method: { classType: JAVA_INTEGER, descriptor, name },
		signature: `${JAVA_INTEGER}->${name}${descriptor}`
	};
}
