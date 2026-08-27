//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaListMethods } from "../core/android/frameworkJavaLists.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves that guest List values cross into arrays without losing order or type.
 * The Awtsmoos renews every reference and bounded cell; Awtsmoos.com records the
 * exact Java contract rather than accepting a package-specific approximation.
 */
test("ArrayList toArray creates an ordered Object array", () => {
	const fixture = createListFixture();
	const first = fixture.heap.allocate("Ljava/lang/Object;");
	const second = fixture.heap.allocate("Ljava/lang/Object;");
	fixture.add(first);
	fixture.add(second);
	const array = fixture.invoke("toArray", "()[Ljava/lang/Object;", [fixture.list]);
	assert.equal(fixture.heap.get(array).type, "[Ljava/lang/Object;");
	assert.equal(fixture.heap.arrayLength(array), 2);
	assert.equal(fixture.heap.arrayGet(array, 0), first);
	assert.equal(fixture.heap.arrayGet(array, 1), second);
});

test("ArrayList toArray reallocates with the supplied guest array type", () => {
	const fixture = createListFixture();
	const first = fixture.heap.allocate("Ljava/lang/String;");
	const second = fixture.heap.allocate("Ljava/lang/String;");
	fixture.add(first);
	fixture.add(second);
	const supplied = fixture.heap.allocateArray("[Ljava/lang/String;", 1);
	const array = fixture.typedToArray(supplied);
	assert.notEqual(array, supplied);
	assert.equal(fixture.heap.get(array).type, "[Ljava/lang/String;");
	assert.equal(fixture.heap.arrayLength(array), 2);
	assert.equal(fixture.heap.arrayGet(array, 0), first);
	assert.equal(fixture.heap.arrayGet(array, 1), second);
});

test("ArrayList toArray reuses capacity and writes one null terminator", () => {
	const fixture = createListFixture();
	const first = fixture.heap.allocate("Ljava/lang/Object;");
	const second = fixture.heap.allocate("Ljava/lang/Object;");
	const untouched = fixture.heap.allocate("Ljava/lang/Object;");
	fixture.add(first);
	fixture.add(second);
	const supplied = fixture.heap.allocateArray("[Ljava/lang/Object;", 4);
	fixture.heap.arraySet(supplied, 2, untouched);
	fixture.heap.arraySet(supplied, 3, untouched);
	const array = fixture.typedToArray(supplied);
	assert.equal(array, supplied);
	assert.equal(fixture.heap.arrayGet(array, 0), first);
	assert.equal(fixture.heap.arrayGet(array, 1), second);
	assert.equal(fixture.heap.arrayGet(array, 2), 0);
	assert.equal(fixture.heap.arrayGet(array, 3), untouched);
});

function createListFixture() {
	const heap = createDalvikObjectHeap();
	const methods = createFrameworkJavaListMethods({ heap });
	const list = heap.allocate("Ljava/util/ArrayList;");
	const invoke = (name, descriptor, args) => methods.invoke(
		methodRecord(name, descriptor),
		args
	);
	invoke("<init>", "()V", [list]);
	return {
		add(value) {
			return invoke("add", "(Ljava/lang/Object;)Z", [list, value]);
		},
		heap,
		invoke,
		list,
		typedToArray(array) {
			return invoke(
				"toArray",
				"([Ljava/lang/Object;)[Ljava/lang/Object;",
				[list, array]
			);
		}
	};
}

function methodRecord(name, descriptor) {
	return {
		method: {
			classType: "Ljava/util/ArrayList;",
			descriptor,
			name
		},
		signature: `Ljava/util/ArrayList;->${name}${descriptor}`
	};
}
