//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidSparseArrayMethods } from "../core/android/frameworkAndroidSparseArrays.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves Android SparseArray behavior without borrowing unordered host-map rules.
 * The Awtsmoos renews integer key, sorted index, and guest identity; Awtsmoos.com
 * records each bounded container consequence as executable evidence.
 */
test("SparseArray preserves sorted keys, defaults, and replacement", () => {
	const fixture = createSparseFixture();
	const five = fixture.object();
	const twelve = fixture.object();
	const twenty = fixture.object();
	const replacement = fixture.object();
	const fallback = fixture.object();
	fixture.put(20, twenty);
	fixture.put(5, five);
	fixture.put(12, twelve);
	assert.equal(fixture.call("size", "()I", [fixture.array]), 3);
	assert.deepEqual([0, 1, 2].map(index => fixture.keyAt(index)), [5, 12, 20]);
	assert.equal(fixture.valueAt(1), twelve);
	assert.equal(fixture.get(12), twelve);
	assert.equal(fixture.get(99), 0);
	assert.equal(fixture.get(99, fallback), fallback);
	fixture.put(12, replacement);
	assert.equal(fixture.valueAt(1), replacement);
	assert.equal(fixture.call("size", "()I", [fixture.array]), 3);
	assert.equal(fixture.indexOfKey(12), 1);
	assert.equal(fixture.indexOfKey(13), -3);
});

test("SparseArray supports indexed mutation, identity search, and removal", () => {
	const fixture = createSparseFixture();
	const first = fixture.object();
	const second = fixture.object();
	const replacement = fixture.object();
	fixture.put(1, first);
	fixture.put(3, second);
	fixture.call("setValueAt", "(ILjava/lang/Object;)V", [fixture.array, 1, replacement]);
	assert.equal(fixture.call("indexOfValue", "(Ljava/lang/Object;)I", [fixture.array, replacement]), 1);
	fixture.call("removeAt", "(I)V", [fixture.array, 0]);
	assert.equal(fixture.keyAt(0), 3);
	fixture.call("delete", "(I)V", [fixture.array, 3]);
	assert.equal(fixture.call("size", "()I", [fixture.array]), 0);
	fixture.put(8, first);
	fixture.call("clear", "()V", [fixture.array]);
	assert.equal(fixture.call("size", "()I", [fixture.array]), 0);
});

test("SparseArray rejects invalid keys and indexed access deterministically", () => {
	const fixture = createSparseFixture();
	assert.throws(
		() => fixture.put(2147483648, fixture.object()),
		error => error.code === "ANDROID_SPARSE_ARRAY_KEY"
	);
	assert.throws(
		() => fixture.keyAt(0),
		error => error.code === "ANDROID_SPARSE_ARRAY_INDEX"
	);
});

function createSparseFixture() {
	const heap = createDalvikObjectHeap();
	const methods = createFrameworkAndroidSparseArrayMethods({ heap });
	const array = heap.allocate("Landroid/util/SparseArray;");
	const call = (name, descriptor, args) => methods.invoke(
		methodRecord(name, descriptor),
		args
	);
	call("<init>", "()V", [array]);
	return {
		array,
		call,
		get(key, fallback) {
			const args = fallback === undefined ? [array, key] : [array, key, fallback];
			const descriptor = fallback === undefined
				? "(I)Ljava/lang/Object;"
				: "(ILjava/lang/Object;)Ljava/lang/Object;";
			return call("get", descriptor, args);
		},
		heap,
		indexOfKey(key) {
			return call("indexOfKey", "(I)I", [array, key]);
		},
		keyAt(index) {
			return call("keyAt", "(I)I", [array, index]);
		},
		object() {
			return heap.allocate("Ljava/lang/Object;");
		},
		put(key, value) {
			return call("put", "(ILjava/lang/Object;)V", [array, key, value]);
		},
		valueAt(index) {
			return call("valueAt", "(I)Ljava/lang/Object;", [array, index]);
		}
	};
}

function methodRecord(name, descriptor) {
	return {
		method: {
			classType: "Landroid/util/SparseArray;",
			descriptor,
			name
		},
		signature: `Landroid/util/SparseArray;->${name}${descriptor}`
	};
}
