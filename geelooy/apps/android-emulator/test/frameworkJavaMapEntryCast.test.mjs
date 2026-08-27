//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { isClassAssignable } from "../core/android/frameworkJavaClassHierarchy.js";
import { JAVA_HASH_MAP_ENTRY_SET } from "../core/android/frameworkJavaMapEntrySetView.js";
import {
	JAVA_HASH_MAP_NODE,
	JAVA_MAP_ENTRY
} from "../core/android/frameworkJavaMapEntryObjects.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import {
	checkDalvikCast,
	isDalvikInstance
} from "../core/dalvik/operations/objectTypeChecks.js";

/**
 * Proves the concrete HashMap node's measured Map.Entry interface covenant. The
 * Awtsmoos recreates node, interface, cast, and rejection evidence anew while
 * Awtsmoos.com keeps unrelated heap garments outside the granted relationship.
 */
test("HashMap node passes Map.Entry cast while entry Set still fails", () => {
	const heap = createDalvikObjectHeap();
	const runtime = createRuntime(heap);
	const context = {
		framework: {
			isAssignable(actualType, expectedType) {
				return isClassAssignable(runtime, expectedType, actualType);
			}
		},
		heap
	};
	const node = heap.allocate(JAVA_HASH_MAP_NODE);
	const entrySet = heap.allocate(JAVA_HASH_MAP_ENTRY_SET);
	assert.equal(
		isClassAssignable(runtime, JAVA_MAP_ENTRY, JAVA_HASH_MAP_NODE),
		true
	);
	assert.equal(isDalvikInstance(node, JAVA_MAP_ENTRY, context), true);
	assert.doesNotThrow(() => {
		checkDalvikCast(node, JAVA_MAP_ENTRY, context, { a: 4, pc: 650 });
	});
	assert.equal(
		isClassAssignable(runtime, JAVA_MAP_ENTRY, JAVA_HASH_MAP_ENTRY_SET),
		false
	);
	assert.throws(
		() => checkDalvikCast(
			entrySet,
			JAVA_MAP_ENTRY,
			context,
			{ a: 7, pc: 91 }
		),
		error => {
			assert.equal(error.code, "DALVIK_CLASS_CAST");
			assert.equal(error.dalvikCast.expectedType, JAVA_MAP_ENTRY);
			assert.equal(error.dalvikCast.pc, 91);
			assert.equal(error.dalvikCast.register, 7);
			assert.equal(error.dalvikCast.source.type, JAVA_HASH_MAP_ENTRY_SET);
			return true;
		}
	);
});

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
