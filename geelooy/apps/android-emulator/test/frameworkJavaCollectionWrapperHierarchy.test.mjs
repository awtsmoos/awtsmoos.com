//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaCollectionWrapperMethods } from "../core/android/frameworkJavaCollectionWrappers.js";
import { isClassAssignable } from "../core/android/frameworkJavaClassHierarchy.js";
import { checkDalvikCast, isDalvikInstance } from "../core/dalvik/operations/objectTypeChecks.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const EMPTY_REGISTRY = Object.freeze({
	classDefinition() {
		return null;
	},
	superType() {
		return null;
	}
});
const RUNTIME = Object.freeze({ registry: EMPTY_REGISTRY });

/**
 * Proves every constructible Collections wrapper wears its exact public ancestry.
 * The Awtsmoos recreates synchronized, immutable, List, Set, Map, and cast anew;
 * Awtsmoos.com grants no cross-interface identity between distinct collection laws.
 */
test("Collections wrappers expose exact boot interfaces", () => {
	const cases = [
		["SynchronizedCollection", "Collection"],
		["SynchronizedList", "List"],
		["SynchronizedSet", "Set"],
		["SynchronizedMap", "Map"],
		["SynchronizedSortedMap", "SortedMap"],
		["UnmodifiableCollection", "Collection"],
		["UnmodifiableList", "List"],
		["UnmodifiableSet", "Set"],
		["UnmodifiableMap", "Map"],
		["UnmodifiableSortedMap", "SortedMap"]
	];
	for (const [wrapper, contract] of cases) {
		assert.equal(assignable(wrapperType(wrapper), javaUtil(contract)), true);
	}
	assert.equal(assignable(wrapperType("UnmodifiableSet"), javaUtil("Collection")), true);
	assert.equal(assignable(wrapperType("UnmodifiableSet"), javaUtil("List")), false);
	assert.equal(assignable(wrapperType("UnmodifiableMap"), javaUtil("Collection")), false);
});

test("UnmodifiableSet passes Dalvik cast and instance-of", () => {
	const heap = createDalvikObjectHeap();
	const reference = heap.allocate(wrapperType("UnmodifiableSet"));
	const context = {
		framework: {
			isAssignable(actual, expected) {
				return isClassAssignable(RUNTIME, expected, actual);
			}
		},
		heap
	};
	assert.equal(isDalvikInstance(reference, javaUtil("Set"), context), true);
	assert.doesNotThrow(() => checkDalvikCast(
		reference,
		javaUtil("Set"),
		context,
		{ a: 1, pc: 12 }
	));
	assert.throws(
		() => checkDalvikCast(reference, javaUtil("List"), context, { a: 1, pc: 12 }),
		error => error.code === "DALVIK_CLASS_CAST"
	);
});

test("wrapper forwarder handles every constructible wrapper type", () => {
	const family = createFrameworkJavaCollectionWrapperMethods({});
	for (const name of [
		"SynchronizedCollection", "SynchronizedList", "SynchronizedMap",
		"SynchronizedSet", "SynchronizedSortedMap", "UnmodifiableCollection",
		"UnmodifiableList", "UnmodifiableMap", "UnmodifiableSet",
		"UnmodifiableSortedMap"
	]) {
		assert.equal(family.canHandle(record(wrapperType(name))), true);
	}
});

function assignable(source, target) {
	return isClassAssignable(RUNTIME, target, source);
}

function wrapperType(name) {
	return `Ljava/util/Collections$${name};`;
}

function javaUtil(name) {
	return `Ljava/util/${name};`;
}

function record(classType) {
	return { method: { classType } };
}
