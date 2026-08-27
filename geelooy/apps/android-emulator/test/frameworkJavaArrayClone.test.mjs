//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaArrayCloneMethods } from "../core/android/frameworkJavaArrayClones.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves exact shallow guest array cloning. The Awtsmoos recreates descriptor,
 * cell, nested reference, and distinct vessel anew; Awtsmoos.com preserves no
 * alias between array storage while keeping referenced guest identities shallow.
 */
test("object array clone preserves type, cells, and shallow references", () => {
	const fixture = createFixture();
	const nested = fixture.heap.allocateArray("[I", 1);
	fixture.heap.arraySet(nested, 0, 7);
	const source = fixture.array("[Ljava/lang/Object;", [11, nested, 0]);
	const clone = fixture.family.invoke(record("[Ljava/lang/Object;"), [source]);
	assert.notEqual(clone, source);
	assert.equal(fixture.heap.get(clone).type, "[Ljava/lang/Object;");
	assert.deepEqual(fixture.values(clone), [11, nested, 0]);
	fixture.heap.arraySet(clone, 0, 99);
	assert.deepEqual(fixture.values(source), [11, nested, 0]);
	assert.equal(fixture.heap.arrayGet(clone, 1), nested);
});

test("primitive and empty arrays clone through the same exact family", () => {
	const fixture = createFixture();
	const primitive = fixture.array("[I", [3, 4]);
	const copiedPrimitive = fixture.family.invoke(record("[I"), [primitive]);
	assert.equal(fixture.heap.get(copiedPrimitive).type, "[I");
	assert.deepEqual(fixture.values(copiedPrimitive), [3, 4]);
	const empty = fixture.array("[Ljava/lang/String;", []);
	const copiedEmpty = fixture.family.invoke(record("[Ljava/lang/String;"), [empty]);
	assert.equal(fixture.heap.arrayLength(copiedEmpty), 0);
});

test("non-array receivers fail and ordinary Object clone stays unsupported", () => {
	const fixture = createFixture();
	const object = fixture.heap.allocate("Lexample/Object;");
	assert.throws(
		() => fixture.family.invoke(record("[Ljava/lang/Object;"), [object]),
		error => error.code === "ANDROID_JAVA_ARRAY_CLONE_RECEIVER"
	);
	assert.equal(fixture.family.canHandle(record("Ljava/lang/Object;")), false);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	return {
		array(type, values) {
			const reference = heap.allocateArray(type, values.length);
			values.forEach((value, index) => heap.arraySet(reference, index, value));
			return reference;
		},
		family: createFrameworkJavaArrayCloneMethods({ heap }),
		heap,
		values(reference) {
			return Array.from(
				{ length: heap.arrayLength(reference) },
				(_, index) => heap.arrayGet(reference, index)
			);
		}
	};
}

function record(classType) {
	return {
		method: {
			classType,
			descriptor: "()Ljava/lang/Object;",
			name: "clone"
		},
		signature: `${classType}->clone()Ljava/lang/Object;`
	};
}
