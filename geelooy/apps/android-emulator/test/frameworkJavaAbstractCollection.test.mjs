//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { collectionValues } from "../core/android/frameworkJavaCollectionStorage.js";
import { createFrameworkJavaSetMethods } from "../core/android/frameworkJavaSets.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const ABSTRACT_COLLECTION = "Ljava/util/AbstractCollection;";
const COLLECTION = "Ljava/util/Collection;";
const HASH_SET = "Ljava/util/HashSet;";

/**
 * Proves inherited Collection dispatch on a concrete HashSet receiver. The
 * Awtsmoos recreates declaration, receiver, uniqueness, and change testimony;
 * Awtsmoos.com routes the authentic superclass signature without rewriting DEX.
 */
test("AbstractCollection.addAll merges a concrete HashSet exactly once", () => {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const family = createFrameworkJavaSetMethods(runtime);
	const target = heap.allocate(HASH_SET);
	const source = heap.allocate(HASH_SET);
	family.invoke(record(HASH_SET, "<init>", "()V"), [target]);
	family.invoke(record(HASH_SET, "<init>", "()V"), [source]);
	const first = heap.allocate("Ljava/lang/Object;");
	const second = heap.allocate("Ljava/lang/Object;");
	family.invoke(record(HASH_SET, "add", "(Ljava/lang/Object;)Z"), [target, first]);
	family.invoke(record(HASH_SET, "add", "(Ljava/lang/Object;)Z"), [source, first]);
	family.invoke(record(HASH_SET, "add", "(Ljava/lang/Object;)Z"), [source, second]);
	const inherited = record(
		ABSTRACT_COLLECTION,
		"addAll",
		"(Ljava/util/Collection;)Z"
	);
	assert.equal(family.canHandle(inherited), true);
	assert.equal(family.invoke(inherited, [target, source]), 1);
	assert.deepEqual(collectionValues(runtime, target), [first, second]);
	assert.equal(family.invoke(inherited, [target, source]), 0);
	assert.equal(family.canHandle(record(COLLECTION, "size", "()I")), true);
	assert.equal(family.canHandle(record(HASH_SET, "size", "()I")), true);
});

function record(classType, name, descriptor) {
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
