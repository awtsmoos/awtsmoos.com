//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { collectionValues } from "../core/android/frameworkJavaCollectionStorage.js";
import { createFrameworkJavaIteratorMethods } from "../core/android/frameworkJavaIterators.js";
import { JAVA_HASH_MAP_ENTRY_SET } from "../core/android/frameworkJavaMapEntrySetView.js";
import { JAVA_MAP_ENTRY } from "../core/android/frameworkJavaMapEntryObjects.js";
import { createFrameworkJavaMapMethods } from "../core/android/frameworkJavaMaps.js";
import { createFrameworkJavaSetMethods } from "../core/android/frameworkJavaSets.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
const HASH_MAP = "Ljava/util/HashMap;";
const ITERATOR = "Ljava/util/Iterator;";
const SET = "Ljava/util/Set;";

/**
 * Proves the live entry Set required by authentic Firebase construction. The
 * Awtsmoos recreates map, node, mutation, and cursor anew; Awtsmoos.com keeps
 * every visible entry bound to one canonical guest mapping.
 */
test("HashMap.entrySet is stable, live, and exposes mutable Map.Entry nodes", () => {
	const fixture = createFixture();
	const map = fixture.mapObject();
	const keyA = fixture.object();
	const keyB = fixture.object();
	const valueA = fixture.object();
	const valueB = fixture.object();
	const replacement = fixture.object();
	fixture.put(map, keyA, valueA);
	const entries = fixture.map("entrySet", "()Ljava/util/Set;", [map]);
	assert.equal(fixture.heap.get(entries).type, JAVA_HASH_MAP_ENTRY_SET);
	assert.equal(fixture.map("entrySet", "()Ljava/util/Set;", [map]), entries);
	fixture.put(map, keyB, valueB);
	assert.equal(fixture.set("size", "()I", [entries]), 2);
	const nodes = collectionValues(fixture.runtime, entries);
	assert.equal(fixture.entry("getKey", "()Ljava/lang/Object;", [nodes[0]]), keyA);
	assert.equal(fixture.entry("getValue", "()Ljava/lang/Object;", [nodes[0]]), valueA);
	assert.equal(
		fixture.entry("setValue", "(Ljava/lang/Object;)Ljava/lang/Object;", [nodes[0], replacement]),
		valueA
	);
	assert.equal(fixture.map("get", "(Ljava/lang/Object;)Ljava/lang/Object;", [map, keyA]), replacement);
});
test("HashMap entry iteration, removal, and clear write through", () => {
	const fixture = createFixture();
	const map = fixture.mapObject();
	const keyA = fixture.object();
	const keyB = fixture.object();
	fixture.put(map, keyA, fixture.object());
	fixture.put(map, keyB, fixture.object());
	const entries = fixture.map("entrySet", "()Ljava/util/Set;", [map]);
	const iterator = fixture.set("iterator", "()Ljava/util/Iterator;", [entries]);
	const first = fixture.iterator("next", "()Ljava/lang/Object;", [iterator]);
	fixture.iterator("remove", "()V", [iterator]);
	assert.equal(fixture.map("containsKey", "(Ljava/lang/Object;)Z", [map, keyA]), 0);
	const remaining = collectionValues(fixture.runtime, entries)[0];
	assert.equal(fixture.set("contains", "(Ljava/lang/Object;)Z", [entries, remaining]), 1);
	assert.equal(fixture.set("remove", "(Ljava/lang/Object;)Z", [entries, remaining]), 1);
	assert.equal(fixture.map("isEmpty", "()Z", [map]), 1);
	fixture.put(map, keyA, fixture.object());
	fixture.set("clear", "()V", [entries]);
	assert.equal(fixture.map("size", "()I", [map]), 0);
	assert.ok(first);
});
test("HashMap entrySet rejects add while values view remains live", () => {
	const fixture = createFixture();
	const map = fixture.mapObject();
	fixture.put(map, fixture.object(), fixture.object());
	const entries = fixture.map("entrySet", "()Ljava/util/Set;", [map]);
	assert.throws(
		() => fixture.set("add", "(Ljava/lang/Object;)Z", [entries, 0]),
		error => error.code === "ANDROID_JAVA_MAP_ENTRY_SET_ADD_UNSUPPORTED"
	);
	const values = fixture.map("values", "()Ljava/util/Collection;", [map]);
	assert.equal(fixture.set("size", "()I", [values]), 1);
});
function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const maps = createFrameworkJavaMapMethods(runtime);
	const sets = createFrameworkJavaSetMethods(runtime);
	const iterators = createFrameworkJavaIteratorMethods(runtime);
	return Object.freeze({
		entry(name, descriptor, args) {
			return maps.invoke(record(JAVA_MAP_ENTRY, name, descriptor), args);
		},
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
