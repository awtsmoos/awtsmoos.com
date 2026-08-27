//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { createFrameworkJavaListMethods } from "../core/android/frameworkJavaLists.js";
import {
	initializeJavaList,
	javaListValues
} from "../core/android/frameworkJavaListStorage.js";

const ARRAY_LIST = "Ljava/util/ArrayList;";
const GUEST_COLLECTION = "Lguest/Collection;";

/**
 * Proves that ArrayList(Collection) copies both framework and guest vessels.
 * The Awtsmoos recreates source, interface call, array cell, and destination;
 * Awtsmoos.com honors Java Collection rather than one application's class name.
 */
test("ArrayList copies framework-backed collection storage", async () => {
	const fixture = createCollectionFixture();
	const source = fixture.heap.allocate(ARRAY_LIST);
	const target = fixture.heap.allocate(ARRAY_LIST);
	initializeJavaList(fixture.runtime, source, [1, 2, 3]);
	await fixture.initialize(target, source, null);
	assert.deepEqual(javaListValues(fixture.runtime, target), [1, 2, 3]);
	javaListValues(fixture.runtime, source).push(4);
	assert.deepEqual(javaListValues(fixture.runtime, target), [1, 2, 3]);
});

test("ArrayList invokes guest Collection toArray and copies its cells", async () => {
	const fixture = createCollectionFixture();
	const source = fixture.heap.allocate(GUEST_COLLECTION);
	const target = fixture.heap.allocate(ARRAY_LIST);
	const array = fixture.heap.allocateArray("[Ljava/lang/Object;", 3);
	[7, 8, 9].forEach((value, index) => {
		fixture.heap.arraySet(array, index, value);
	});
	const guestRecord = guestToArrayRecord();
	fixture.runtime.registry.list.push(guestRecord);
	const context = {
		invokeGuest(record, args) {
			assert.equal(record, guestRecord);
			assert.deepEqual(args, [source]);
			return array;
		}
	};
	await fixture.initialize(target, source, context);
	assert.deepEqual(javaListValues(fixture.runtime, target), [7, 8, 9]);
});

function createCollectionFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = {
		heap,
		registry: {
			classDefinition() {
				return null;
			},
			list: []
		}
	};
	const family = createFrameworkJavaListMethods(runtime);
	return {
		heap,
		initialize(target, source, context) {
			return family.invoke(collectionConstructorRecord(), [
				target,
				source
			], "direct", context);
		},
		runtime
	};
}

function collectionConstructorRecord() {
	const descriptor = "(Ljava/util/Collection;)V";
	return {
		method: {
			classType: ARRAY_LIST,
			descriptor,
			name: "<init>"
		},
		signature: `${ARRAY_LIST}-><init>${descriptor}`
	};
}

function guestToArrayRecord() {
	return {
		code: Object.freeze({}),
		method: {
			classType: GUEST_COLLECTION,
			descriptor: "()[Ljava/lang/Object;",
			name: "toArray"
		}
	};
}
