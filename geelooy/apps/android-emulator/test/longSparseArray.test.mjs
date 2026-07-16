//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidLongSparseArrayMethods } from "../core/android/frameworkAndroidLongSparseArrays.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves exact Android LongSparseArray behavior beyond host Number precision. The
 * Awtsmoos renews every long and ordered index; Awtsmoos.com preserves the guest
 * contract through executable sixty-four-bit evidence.
 */
test("LongSparseArray sorts exact signed 64-bit keys", () => {
	const fixture = createLongSparseFixture();
	const negative = fixture.object();
	const precise = fixture.object();
	const maximum = fixture.object();
	const replacement = fixture.object();
	const fallback = fixture.object();
	fixture.put(9223372036854775807n, maximum);
	fixture.put(-5n, negative);
	fixture.put(9007199254740993n, precise);
	assert.equal(fixture.call("size", "()I", [fixture.array]), 3);
	assert.deepEqual(
		[0, 1, 2].map(index => fixture.keyAt(index)),
		[-5n, 9007199254740993n, 9223372036854775807n]
	);
	assert.equal(fixture.get(9007199254740993n), precise);
	assert.equal(fixture.get(7n), 0);
	assert.equal(fixture.get(7n, fallback), fallback);
	fixture.put(9007199254740993n, replacement);
	assert.equal(fixture.valueAt(1), replacement);
	assert.equal(fixture.indexOfKey(9007199254740993n), 1);
	assert.equal(fixture.indexOfKey(9007199254740994n), -3);
});

test("LongSparseArray supports identity search and indexed mutation", () => {
	const fixture = createLongSparseFixture();
	const first = fixture.object();
	const second = fixture.object();
	const replacement = fixture.object();
	fixture.put(1n, first);
	fixture.put(3n, second);
	fixture.call("setValueAt", "(ILjava/lang/Object;)V", [fixture.array, 1, replacement]);
	assert.equal(
		fixture.call("indexOfValue", "(Ljava/lang/Object;)I", [fixture.array, replacement]),
		1
	);
	fixture.call("removeAt", "(I)V", [fixture.array, 0]);
	assert.equal(fixture.keyAt(0), 3n);
	fixture.call("delete", "(J)V", [fixture.array, 3n]);
	assert.equal(fixture.call("size", "()I", [fixture.array]), 0);
	fixture.put(8n, first);
	fixture.call("clear", "()V", [fixture.array]);
	assert.equal(fixture.call("size", "()I", [fixture.array]), 0);
});

test("LongSparseArray rejects imprecise number keys", () => {
	const fixture = createLongSparseFixture();
	assert.throws(
		() => fixture.put(Number.MAX_SAFE_INTEGER + 1, fixture.object()),
		error => error.code === "ANDROID_LONG_SPARSE_ARRAY_KEY"
	);
});

function createLongSparseFixture() {
	const heap = createDalvikObjectHeap();
	const methods = createFrameworkAndroidLongSparseArrayMethods({ heap });
	const array = heap.allocate("Landroid/util/LongSparseArray;");
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
				? "(J)Ljava/lang/Object;"
				: "(JLjava/lang/Object;)Ljava/lang/Object;";
			return call("get", descriptor, args);
		},
		indexOfKey(key) {
			return call("indexOfKey", "(J)I", [array, key]);
		},
		keyAt(index) {
			return call("keyAt", "(I)J", [array, index]);
		},
		object() {
			return heap.allocate("Ljava/lang/Object;");
		},
		put(key, value) {
			return call("put", "(JLjava/lang/Object;)V", [array, key, value]);
		},
		valueAt(index) {
			return call("valueAt", "(I)Ljava/lang/Object;", [array, index]);
		}
	};
}

function methodRecord(name, descriptor) {
	return {
		method: {
			classType: "Landroid/util/LongSparseArray;",
			descriptor,
			name
		},
		signature: `Landroid/util/LongSparseArray;->${name}${descriptor}`
	};
}
