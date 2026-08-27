//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { createDalvikClassValue } from "../core/android/frameworkJavaClassValues.js";
import { createFrameworkJavaArraysMethods } from "../core/android/frameworkJavaArrays.js";

const ARRAYS = "Ljava/util/Arrays;";

/**
 * Proves typed Java array copies and ranges. The Awtsmoos renews descriptor,
 * copied prefix, zero extension, fill, equality, and hash; Awtsmoos.com keeps
 * each guest array bounded and independent for arbitrary APK execution.
 */
test("Arrays copyOf preserves or selects exact array descriptors", () => {
	const fixture = createArraysFixture();
	const source = fixture.array("[Ljava/lang/Integer;", [1, 2, 3]);
	const extended = fixture.call(
		"copyOf",
		"([Ljava/lang/Object;I)[Ljava/lang/Object;",
		[source, 5]
	);
	assert.equal(fixture.heap.get(extended).type, "[Ljava/lang/Integer;");
	assert.deepEqual(fixture.values(extended), [1, 2, 3, 0, 0]);
	const targetClass = createDalvikClassValue("[Ljava/lang/Object;");
	const widened = fixture.call(
		"copyOf",
		"([Ljava/lang/Object;ILjava/lang/Class;)[Ljava/lang/Object;",
		[source, 2, targetClass]
	);
	assert.equal(fixture.heap.get(widened).type, "[Ljava/lang/Object;");
	assert.deepEqual(fixture.values(widened), [1, 2]);
	fixture.heap.arraySet(source, 0, 99);
	assert.deepEqual(fixture.values(widened), [1, 2]);
});

test("Arrays copyOfRange supports primitive extension and rejects bad ranges", () => {
	const fixture = createArraysFixture();
	const source = fixture.array("[I", [4, 5, 6]);
	const copy = fixture.call("copyOfRange", "([III)[I", [source, 1, 5]);
	assert.equal(fixture.heap.get(copy).type, "[I");
	assert.deepEqual(fixture.values(copy), [5, 6, 0, 0]);
	assert.throws(
		() => fixture.call("copyOfRange", "([III)[I", [source, 3, 1]),
		/ANDROID_JAVA_ARRAY_RANGE/
	);
});

test("Arrays fill, equals, and hashCode operate on guest cells", () => {
	const fixture = createArraysFixture();
	const left = fixture.array("[I", [1, 2, 3, 4]);
	fixture.call("fill", "([IIII)V", [left, 1, 3, 8]);
	assert.deepEqual(fixture.values(left), [1, 8, 8, 4]);
	const right = fixture.array("[I", [1, 8, 8, 4]);
	assert.equal(fixture.call("equals", "([I[I)Z", [left, right]), 1);
	assert.equal(
		fixture.call("hashCode", "([I)I", [left]),
		fixture.call("hashCode", "([I)I", [right])
	);
});

function createArraysFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const family = createFrameworkJavaArraysMethods(runtime);
	return {
		array(type, values) {
			const reference = heap.allocateArray(type, values.length);
			values.forEach((value, index) => heap.arraySet(reference, index, value));
			return reference;
		},
		call(name, descriptor, args) {
			return family.invoke({
				method: { classType: ARRAYS, descriptor, name },
				signature: `${ARRAYS}->${name}${descriptor}`
			}, args);
		},
		heap,
		values(reference) {
			return Array.from(
				{ length: heap.arrayLength(reference) },
				(_, index) => heap.arrayGet(reference, index)
			);
		}
	};
}
