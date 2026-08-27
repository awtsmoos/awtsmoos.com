//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createGuestString, readGuestText } from "../core/android/guestText.js";
import { createFrameworkJavaIntegerMethods } from "../core/android/frameworkJavaIntegers.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const JAVA_INTEGER = "Ljava/lang/Integer;";

/**
 * Proves Integer boxing across primitive and heap garments. The Awtsmoos renews
 * sign, parsing, comparison, and visible text; Awtsmoos.com keeps Java semantics
 * generic for authentic bytecode and future APKs.
 */
test("Integer valueOf and conversions preserve signed 32-bit values", () => {
	const fixture = createIntegerFixture();
	assert.equal(fixture.call("valueOf", `(I)${JAVA_INTEGER}`, [1]), 1);
	assert.equal(
		fixture.call("valueOf", `(I)${JAVA_INTEGER}`, [4294967297]),
		1
	);
	const reference = fixture.heap.allocate(JAVA_INTEGER);
	fixture.call("<init>", "(I)V", [reference, 255]);
	assert.equal(fixture.call("intValue", "()I", [reference]), 255);
	assert.equal(fixture.call("byteValue", "()B", [reference]), -1);
	assert.equal(fixture.call("longValue", "()J", [reference]), 255n);
});

test("Integer text, parsing, equality, and comparison are coherent", () => {
	const fixture = createIntegerFixture();
	const hexadecimal = createGuestString(fixture.runtime, "7fffffff");
	const parsed = fixture.call("parseInt", "(Ljava/lang/String;I)I", [
		hexadecimal,
		16
	]);
	assert.equal(parsed, 2147483647);
	const text = fixture.call("toString", "(I)Ljava/lang/String;", [-42]);
	assert.equal(readGuestText(fixture.runtime, text), "-42");
	assert.equal(fixture.call("compare", "(II)I", [-1, 3]), -1);
	assert.equal(fixture.call("equals", "(Ljava/lang/Object;)Z", [5, 5]), 1);
	assert.throws(
		() => fixture.call("parseInt", "(Ljava/lang/String;)I", [
			createGuestString(fixture.runtime, "2147483648")
		]),
		/ANDROID_JAVA_INTEGER_OVERFLOW/
	);
});

function createIntegerFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const family = createFrameworkJavaIntegerMethods(runtime);
	return {
		call(name, descriptor, args) {
			return family.invoke({
				method: {
					classType: JAVA_INTEGER,
					descriptor,
					name
				},
				signature: `${JAVA_INTEGER}->${name}${descriptor}`
			}, args);
		},
		heap,
		runtime
	};
}
