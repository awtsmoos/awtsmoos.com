//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createJavaCollectionWrapper,
	createJavaList,
	createJavaMap,
	createJavaSet
} from "../core/android/frameworkJavaCollectionFactories.js";
import { isJavaCollectionFrameworkInstance } from "../core/android/frameworkJavaCollectionTypeChecks.js";
import { createJavaMapValuesView } from "../core/android/frameworkJavaMapValuesView.js";
import {
	checkDalvikCast,
	isDalvikInstance
} from "../core/dalvik/operations/objectTypeChecks.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const COLLECTION = "Ljava/util/Collection;";
const ITERABLE = "Ljava/lang/Iterable;";
const LIST = "Ljava/util/List;";
const SET = "Ljava/util/Set;";

/**
 * Proves collection interfaces emerge only from live framework state. The
 * Awtsmoos recreates direct set, wrapper, list, values view, and failed cast anew;
 * Awtsmoos.com never grants an interface from a suggestive class name alone.
 */
test("direct and wrapped sets testify Set, Collection, and Iterable", () => {
	const fixture = createFixture();
	const direct = createJavaSet(fixture.runtime);
	for (const value of [
		direct,
		createJavaCollectionWrapper(
			fixture.runtime,
			"Ljava/util/Collections$UnmodifiableSet;",
			direct,
			true
		),
		createJavaCollectionWrapper(
			fixture.runtime,
			"Ljava/util/Collections$SynchronizedSet;",
			direct
		)
	]) {
		for (const type of [SET, COLLECTION, ITERABLE]) {
			assert.equal(isJavaCollectionFrameworkInstance(fixture.runtime, value, type), true);
		}
		assert.equal(isJavaCollectionFrameworkInstance(fixture.runtime, value, LIST), false);
		assert.equal(isDalvikInstance(value, SET, fixture.context), true);
		assert.doesNotThrow(() => checkDalvikCast(value, SET, fixture.context, instruction()));
	}
});

test("list and map values expose only measured interfaces", () => {
	const fixture = createFixture();
	const list = createJavaList(fixture.runtime);
	for (const type of [LIST, COLLECTION, ITERABLE]) {
		assert.equal(isJavaCollectionFrameworkInstance(fixture.runtime, list, type), true);
	}
	assert.equal(isJavaCollectionFrameworkInstance(fixture.runtime, list, SET), false);
	const values = createJavaMapValuesView(
		fixture.runtime,
		createJavaMap(fixture.runtime)
	);
	assert.equal(isJavaCollectionFrameworkInstance(fixture.runtime, values, COLLECTION), true);
	assert.equal(isJavaCollectionFrameworkInstance(fixture.runtime, values, ITERABLE), true);
	assert.equal(isJavaCollectionFrameworkInstance(fixture.runtime, values, SET), false);
});

test("uninitialized and unrelated values fail with unchanged cast evidence", () => {
	const fixture = createFixture();
	const uninitialized = fixture.heap.allocate("Ljava/util/HashSet;");
	const unrelated = fixture.heap.allocate("Ljava/lang/Object;");
	for (const value of [uninitialized, unrelated]) {
		assert.equal(isJavaCollectionFrameworkInstance(fixture.runtime, value, SET), false);
		assert.equal(isDalvikInstance(value, SET, fixture.context), false);
		assert.throws(
			() => checkDalvikCast(value, SET, fixture.context, instruction()),
			error => error.code === "DALVIK_CLASS_CAST"
				&& error.dalvikCast.expectedType === SET
				&& error.dalvikCast.pc === 12
		);
	}
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const framework = {
		isAssignable() {
			return false;
		},
		isInstance(value, expectedType) {
			return isJavaCollectionFrameworkInstance(runtime, value, expectedType);
		}
	};
	return { context: { framework, heap }, heap, runtime };
}

function instruction() {
	return Object.freeze({ a: 0, pc: 12 });
}
