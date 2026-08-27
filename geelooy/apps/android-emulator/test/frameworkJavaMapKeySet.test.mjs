//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { collectionValues } from "../core/android/frameworkJavaCollectionStorage.js";
import { createFrameworkJavaIteratorMethods } from "../core/android/frameworkJavaIterators.js";
import { JAVA_HASH_MAP_KEY_SET } from "../core/android/frameworkJavaMapKeySetView.js";
import { createFrameworkJavaMapMethods } from "../core/android/frameworkJavaMaps.js";
import { createFrameworkJavaSetMethods } from "../core/android/frameworkJavaSets.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const HASH_MAP = "Ljava/util/HashMap;";
const ITERATOR = "Ljava/util/Iterator;";
const SET = "Ljava/util/Set;";

/**
 * Proves the live key Set required by authentic Firebase construction. The
 * Awtsmoos recreates cache, key order, mutation, and iterator path anew;
 * Awtsmoos.com keeps the backing map authoritative behind one stable guest view.
 */
test("HashMap.keySet is stable, live, ordered, and searchable", () => {
	const fixture = createFixture();
	const map = fixture.mapObject();
	const keyA = fixture.object();
	const keyB = fixture.object();
	fixture.put(map, keyA, fixture.object());
	const keys = fixture.map("keySet", "()Ljava/util/Set;", [map]);
	assert.equal(fixture.heap.get(keys).type, JAVA_HASH_MAP_KEY_SET);
	assert.equal(fixture.map("keySet", "()Ljava/util/Set;", [map]), keys);
	fixture.put(map, keyB, fixture.object());
	assert.deepEqual(collectionValues(fixture.runtime, keys), [keyA, keyB]);
	assert.equal(fixture.set("contains", "(Ljava/lang/Object;)Z", [keys, keyB]), 1);
});

test("HashMap key removal, iterator removal, and clear write through", () => {
	const fixture = createFixture();
	const map = fixture.mapObject();
	const keyA = fixture.object();
	const keyB = fixture.object();
	fixture.put(map, keyA, fixture.object());
	fixture.put(map, keyB, fixture.object());
	const keys = fixture.map("keySet", "()Ljava/util/Set;", [map]);
	assert.equal(fixture.set("remove", "(Ljava/lang/Object;)Z", [keys, keyA]), 1);
	assert.equal(fixture.map("containsKey", "(Ljava/lang/Object;)Z", [map, keyA]), 0);
	const iterator = fixture.set("iterator", "()Ljava/util/Iterator;", [keys]);
	assert.equal(fixture.iterator("next", "()Ljava/lang/Object;", [iterator]), keyB);
	fixture.iterator("remove", "()V", [iterator]);
	assert.equal(fixture.map("isEmpty", "()Z", [map]), 1);
	fixture.put(map, keyA, fixture.object());
	fixture.set("clear", "()V", [keys]);
	assert.equal(fixture.map("size", "()I", [map]), 0);
});

test("HashMap keySet rejects add while other views coexist", () => {
	const fixture = createFixture();
	const map = fixture.mapObject();
	fixture.put(map, fixture.object(), fixture.object());
	const keys = fixture.map("keySet", "()Ljava/util/Set;", [map]);
	assert.throws(
		() => fixture.set("add", "(Ljava/lang/Object;)Z", [keys, fixture.object()]),
		error => error.code === "ANDROID_JAVA_MAP_KEY_SET_ADD_UNSUPPORTED"
	);
	const values = fixture.map("values", "()Ljava/util/Collection;", [map]);
	const entries = fixture.map("entrySet", "()Ljava/util/Set;", [map]);
	assert.equal(fixture.set("size", "()I", [values]), 1);
	assert.equal(fixture.set("size", "()I", [entries]), 1);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const maps = createFrameworkJavaMapMethods(runtime);
	const sets = createFrameworkJavaSetMethods(runtime);
	const iterators = createFrameworkJavaIteratorMethods(runtime);
	return Object.freeze({
		heap,
		iterator(name, descriptor, args) {
			return iterators.invoke(record(ITERATOR, name, descriptor), args);
		},
		map(name, descriptor, args) {
			return maps.invoke(record(HASH_MAP, name, descriptor), args);
		},
		mapObject() {
			const map = heap.allocate(HASH_MAP);
			maps.invoke(record(HASH_MAP, "<init>", "()V"), [map]);
			return map;
		},
		object() {
			return heap.allocate("Ljava/lang/Object;");
		},
		put(map, key, value) {
			return maps.invoke(record(HASH_MAP, "put", "(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;"), [map, key, value]);
		},
		runtime,
		set(name, descriptor, args) {
			return sets.invoke(record(SET, name, descriptor), args);
		}
	});
}

function record(classType, name, descriptor) {
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
