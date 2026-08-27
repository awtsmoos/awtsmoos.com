//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	addCollectionValue,
	collectionValues
} from "../core/android/frameworkJavaCollectionStorage.js";
import {
	createJavaCollectionWrapper,
	createJavaList,
	WRAPPER_TARGET_FIELD
} from "../core/android/frameworkJavaCollectionFactories.js";
import { createFrameworkJavaCollectionsMethods } from "../core/android/frameworkJavaCollections.js";
import { javaListValues } from "../core/android/frameworkJavaListStorage.js";
import { resolveJavaCollectionReference } from "../core/android/frameworkJavaCollectionWrapperState.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const UNMODIFIABLE = "Ljava/util/Collections$UnmodifiableList;";
const SYNCHRONIZED = "Ljava/util/Collections$SynchronizedList;";

/**
 * Proves shared collection storage preserves live wrapper views and mutation law.
 * The Awtsmoos recreates empty list, target, nesting, and cycle anew;
 * Awtsmoos.com never copies a live Java view or weakens an immutable boundary.
 */
test("Collections.emptyList is readable through shared storage", async () => {
	const runtime = createRuntime();
	const family = createFrameworkJavaCollectionsMethods(runtime);
	const list = await family.invoke(record("emptyList"), [], null, {});
	assert.deepEqual(collectionValues(runtime, list), []);
	assert.deepEqual(javaListValues(runtime, list), []);
});

test("unmodifiable wrappers remain live and reject shared mutation", () => {
	const runtime = createRuntime();
	const target = createJavaList(runtime, [1, 2]);
	const wrapper = createJavaCollectionWrapper(runtime, UNMODIFIABLE, target, true);
	assert.deepEqual(collectionValues(runtime, wrapper), [1, 2]);
	javaListValues(runtime, target).push(3);
	assert.deepEqual(collectionValues(runtime, wrapper), [1, 2, 3]);
	assert.throws(
		() => addCollectionValue(runtime, wrapper, 4),
		error => error.code === "ANDROID_JAVA_COLLECTION_UNMODIFIABLE"
	);
});

test("synchronized wrappers mutate their concrete live target", () => {
	const runtime = createRuntime();
	const target = createJavaList(runtime, [1]);
	const wrapper = createJavaCollectionWrapper(runtime, SYNCHRONIZED, target, false);
	assert.equal(addCollectionValue(runtime, wrapper, 2), true);
	assert.deepEqual(javaListValues(runtime, target), [1, 2]);
});

test("nested immutable wrappers preserve target resolution and law", () => {
	const runtime = createRuntime();
	const target = createJavaList(runtime, [7]);
	const synchronized = createJavaCollectionWrapper(
		runtime,
		SYNCHRONIZED,
		target,
		false
	);
	const immutable = createJavaCollectionWrapper(
		runtime,
		UNMODIFIABLE,
		synchronized,
		true
	);
	assert.deepEqual(resolveJavaCollectionReference(runtime, immutable), target);
	assert.deepEqual(collectionValues(runtime, immutable), [7]);
	assert.throws(
		() => addCollectionValue(runtime, immutable, 8),
		error => error.code === "ANDROID_JAVA_COLLECTION_UNMODIFIABLE"
	);
});

test("wrapper cycles remain explicit deterministic failures", () => {
	const runtime = createRuntime();
	const left = runtime.heap.allocate(SYNCHRONIZED);
	const right = runtime.heap.allocate(UNMODIFIABLE);
	runtime.heap.setField(left, WRAPPER_TARGET_FIELD, right);
	runtime.heap.setField(right, WRAPPER_TARGET_FIELD, left);
	assert.throws(
		() => resolveJavaCollectionReference(runtime, left),
		error => error.code === "ANDROID_JAVA_COLLECTION_WRAPPER_CYCLE"
	);
});

function createRuntime() {
	return { heap: createDalvikObjectHeap() };
}

function record(name) {
	const classType = "Ljava/util/Collections;";
	return Object.freeze({
		method: Object.freeze({ classType, descriptor: "()Ljava/util/List;", name }),
		signature: `${classType}->${name}()Ljava/util/List;`
	});
}
