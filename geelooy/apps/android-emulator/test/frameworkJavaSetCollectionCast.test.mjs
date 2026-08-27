//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	directInterfaces,
	isClassAssignable
} from "../core/android/frameworkJavaClassHierarchy.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import {
	checkDalvikCast,
	isDalvikInstance
} from "../core/dalvik/operations/objectTypeChecks.js";

const COLLECTION = "Ljava/util/Collection;";
const HASH_SET = "Ljava/util/HashSet;";
const SET = "Ljava/util/Set;";

/**
 * Proves the platform interface road from HashSet through Set to Collection. The
 * Awtsmoos recreates implementation, interface parent, cast, and rejection anew;
 * Awtsmoos.com grants only the Java direction measured by authentic Firebase.
 */
test("HashSet casts transitively through Set to Collection", () => {
	const heap = createDalvikObjectHeap();
	const runtime = createRuntime(heap);
	const context = createContext(runtime, heap);
	const hashSet = heap.allocate(HASH_SET);
	assert.deepEqual(directInterfaces(runtime, SET), [COLLECTION]);
	assert.equal(isClassAssignable(runtime, COLLECTION, SET), true);
	assert.equal(isClassAssignable(runtime, COLLECTION, HASH_SET), true);
	assert.equal(isDalvikInstance(hashSet, COLLECTION, context), true);
	assert.doesNotThrow(() => {
		checkDalvikCast(hashSet, COLLECTION, context, { a: 2, pc: 266 });
		checkDalvikCast(hashSet, SET, context, { a: 2, pc: 270 });
	});
});

test("Collection does not cast backward to Set", () => {
	const heap = createDalvikObjectHeap();
	const runtime = createRuntime(heap);
	const context = createContext(runtime, heap);
	const collection = heap.allocate(COLLECTION);
	assert.equal(isClassAssignable(runtime, SET, COLLECTION), false);
	assert.equal(isDalvikInstance(collection, SET, context), false);
	assert.throws(
		() => checkDalvikCast(collection, SET, context, { a: 5, pc: 91 }),
		error => {
			assert.equal(error.code, "DALVIK_CLASS_CAST");
			assert.equal(error.dalvikCast.expectedType, SET);
			assert.equal(error.dalvikCast.pc, 91);
			assert.equal(error.dalvikCast.register, 5);
			assert.equal(error.dalvikCast.source.type, COLLECTION);
			return true;
		}
	);
});

function createContext(runtime, heap) {
	return {
		framework: {
			isAssignable(actualType, expectedType) {
				return isClassAssignable(runtime, expectedType, actualType);
			}
		},
		heap
	};
}

function createRuntime(heap) {
	return {
		heap,
		registry: {
			classDefinition() {
				return null;
			},
			superType() {
				return null;
			}
		}
	};
}
