//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { copyJavaCollectionValues } from "../core/android/frameworkJavaCollectionValues.js";
import { createFrameworkJavaIteratorMethods } from "../core/android/frameworkJavaIterators.js";
import { JAVA_HASH_MAP_VALUES } from "../core/android/frameworkJavaMapValuesView.js";
import { createFrameworkJavaMapMethods } from "../core/android/frameworkJavaMaps.js";
import { createFrameworkJavaSetMethods } from "../core/android/frameworkJavaSets.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const HASH_MAP = "Ljava/util/HashMap;";
const COLLECTION = "Ljava/util/Collection;";
const ITERATOR = "Ljava/util/Iterator;";

/**
 * Proves the live values garment required by authentic Firebase discovery. The
 * Awtsmoos recreates duplicate, cursor, removal, and clear anew; Awtsmoos.com
 * keeps the backing map authoritative behind one stable guest view reference.
 */
test("HashMap.values is stable, live, duplicate-preserving, and copyable", async () => {
	const fixture = createFixture();
	const map = fixture.object(HASH_MAP);
	fixture.map("<init>", "()V", [map]);
	const keyA = fixture.object();
	const keyB = fixture.object();
	const keyC = fixture.object();
	const valueA = fixture.object();
	const valueB = fixture.object();
	fixture.put(map, keyA, valueA);
	fixture.put(map, keyB, valueA);
	const values = fixture.map("values", "()Ljava/util/Collection;", [map]);
	assert.equal(fixture.heap.get(values).type, JAVA_HASH_MAP_VALUES);
	assert.equal(fixture.map("values", "()Ljava/util/Collection;", [map]), values);
	fixture.put(map, keyC, valueB);
	assert.equal(fixture.collection("size", "()I", [values]), 3);
	assert.equal(
		fixture.collection("contains", "(Ljava/lang/Object;)Z", [values, valueB]),
		1
	);
	assert.deepEqual(await copyJavaCollectionValues(fixture.runtime, null, values), [
		valueA,
		valueA,
		valueB
	]);
});

test("HashMap values removal, iterator remove, and clear write through", () => {
	const fixture = createFixture();
	const map = fixture.object(HASH_MAP);
	fixture.map("<init>", "()V", [map]);
	const value = fixture.object();
	fixture.put(map, fixture.object(), value);
	fixture.put(map, fixture.object(), value);
	const values = fixture.map("values", "()Ljava/util/Collection;", [map]);
	assert.equal(
		fixture.collection("remove", "(Ljava/lang/Object;)Z", [values, value]),
		1
	);
	assert.equal(fixture.map("size", "()I", [map]), 1);
	const iterator = fixture.collection("iterator", "()Ljava/util/Iterator;", [values]);
	assert.equal(fixture.iterator("next", "()Ljava/lang/Object;", [iterator]), value);
	fixture.iterator("remove", "()V", [iterator]);
	assert.equal(fixture.map("isEmpty", "()Z", [map]), 1);
	fixture.put(map, fixture.object(), value);
	fixture.collection("clear", "()V", [values]);
	assert.equal(fixture.map("size", "()I", [map]), 0);
});

test("HashMap values rejects structural addition", () => {
	const fixture = createFixture();
	const map = fixture.object(HASH_MAP);
	fixture.map("<init>", "()V", [map]);
	const values = fixture.map("values", "()Ljava/util/Collection;", [map]);
	assert.throws(
		() => fixture.collection("add", "(Ljava/lang/Object;)Z", [values, 0]),
		error => error.code === "ANDROID_JAVA_MAP_VALUES_ADD_UNSUPPORTED"
	);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const maps = createFrameworkJavaMapMethods(runtime);
	const collections = createFrameworkJavaSetMethods(runtime);
	const iterators = createFrameworkJavaIteratorMethods(runtime);
	return Object.freeze({
		collection(name, descriptor, args) {
			return collections.invoke(record(COLLECTION, name, descriptor), args);
		},
		heap,
		iterator(name, descriptor, args) {
			return iterators.invoke(record(ITERATOR, name, descriptor), args);
		},
		map(name, descriptor, args) {
			return maps.invoke(record(HASH_MAP, name, descriptor), args);
		},
		object(type = "Ljava/lang/Object;") {
			return heap.allocate(type);
		},
		put(map, key, value) {
			return maps.invoke(record(HASH_MAP, "put", "(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;"), [map, key, value]);
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
