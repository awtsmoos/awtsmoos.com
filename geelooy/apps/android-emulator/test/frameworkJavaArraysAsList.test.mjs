//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaArraysMethods } from "../core/android/frameworkJavaArrays.js";
import {
	JAVA_ARRAYS_LIST
} from "../core/android/frameworkJavaArraysAsListState.js";
import { copyJavaCollectionValues } from "../core/android/frameworkJavaCollectionValues.js";
import { createFrameworkJavaListMethods } from "../core/android/frameworkJavaLists.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const ARRAYS = "Ljava/util/Arrays;";

/**
 * Proves the live fixed-size view required by authentic Firebase registrar code.
 * The Awtsmoos recreates subtype array, list, replacement, and rejection anew;
 * Awtsmoos.com keeps every observable value inside the bounded guest heap.
 */
test("Arrays.asList preserves live subtype-array backing and write-through set", async () => {
	const fixture = createFixture();
	const first = fixture.object("LS1/a;");
	const second = fixture.object("LS1/a;");
	const replacement = fixture.object("LS1/a;");
	const array = fixture.heap.allocateArray("[LS1/a;", 2);
	fixture.heap.arraySet(array, 0, first);
	fixture.heap.arraySet(array, 1, second);
	const list = fixture.asList(array);
	assert.equal(fixture.heap.get(list).type, JAVA_ARRAYS_LIST);
	assert.equal(fixture.list("size", "()I", [list]), 2);
	assert.equal(fixture.list("get", "(I)Ljava/lang/Object;", [list, 0]), first);
	fixture.heap.arraySet(array, 0, replacement);
	assert.equal(
		fixture.list("get", "(I)Ljava/lang/Object;", [list, 0]),
		replacement
	);
	assert.equal(
		fixture.list("set", "(ILjava/lang/Object;)Ljava/lang/Object;", [list, 1, first]),
		second
	);
	assert.equal(fixture.heap.arrayGet(array, 1), first);
	assert.deepEqual(await copyJavaCollectionValues(fixture.runtime, null, list), [
		replacement,
		first
	]);
});

test("Arrays.asList rejects structural mutation but permits null replacement", async () => {
	const fixture = createFixture();
	const array = fixture.heap.allocateArray("[Ljava/lang/Object;", 1);
	const list = fixture.asList(array);
	assert.equal(
		fixture.list("set", "(ILjava/lang/Object;)Ljava/lang/Object;", [list, 0, 0]),
		0
	);
	for (const [name, descriptor, args] of [
		["add", "(Ljava/lang/Object;)Z", [list, 0]],
		["remove", "(I)Ljava/lang/Object;", [list, 0]],
		["clear", "()V", [list]]
	]) {
		assert.throws(
			() => fixture.list(name, descriptor, args),
			error => error.code === "ANDROID_JAVA_LIST_FIXED_SIZE"
		);
	}
	await assert.rejects(
		fixture.list("addAll", "(Ljava/util/Collection;)Z", [list, list]),
		error => error.code === "ANDROID_JAVA_LIST_FIXED_SIZE"
	);
});

test("Arrays.asList accepts reference arrays and rejects primitive or null inputs", () => {
	const fixture = createFixture();
	const nested = fixture.heap.allocateArray("[[I", 0);
	assert.equal(fixture.heap.get(fixture.asList(nested)).type, JAVA_ARRAYS_LIST);
	const primitive = fixture.heap.allocateArray("[I", 1);
	assert.throws(
		() => fixture.asList(primitive),
		error => error.code === "ANDROID_JAVA_ARRAYS_AS_LIST_REFERENCE_ARRAY_REQUIRED"
	);
	assert.throws(
		() => fixture.asList(0),
		error => error.code === "ANDROID_JAVA_ARRAYS_AS_LIST_ARRAY_REQUIRED"
	);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const arrays = createFrameworkJavaArraysMethods(runtime);
	const lists = createFrameworkJavaListMethods(runtime);
	return Object.freeze({
		asList(array) {
			return arrays.invoke(record(ARRAYS, "asList", "([Ljava/lang/Object;)Ljava/util/List;"), [array]);
		},
		heap,
		list(name, descriptor, args) {
			return lists.invoke(record(JAVA_ARRAYS_LIST, name, descriptor), args, null, null);
		},
		object(type) {
			return heap.allocate(type);
		},
		runtime
	});
}

function record(classType, name, descriptor) {
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
