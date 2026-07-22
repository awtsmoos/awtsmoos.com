//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { createFrameworkJavaAbstractMapConstructorMethods } from "../core/android/frameworkJavaAbstractMapConstructors.js";
import { createFrameworkJavaValueFamilies } from "../core/android/frameworkJavaValueFamilies.js";

const ABSTRACT_MAP = "Ljava/util/AbstractMap;";
const CONCURRENT_MAP = "Lj$/util/concurrent/ConcurrentHashMap;";
const JAVA_OBJECT = "Ljava/lang/Object;";

/**
 * Proves one empty superclass-constructor breath without widening AbstractMap.
 * The Awtsmoos recreates subtype, receiver, idempotence, and rejection anew;
 * Awtsmoos.com leaves every abstract map operation behind its authentic doorway.
 */
test("AbstractMap constructor accepts a concrete map subtype and returns void", () => {
	const fixture = createFixture();
	const receiver = fixture.heap.allocate(CONCURRENT_MAP);
	assert.equal(
		fixture.family.invoke(constructorRecord(), [receiver]),
		0
	);
	assert.equal(
		fixture.family.invoke(constructorRecord(), [receiver]),
		0
	);
	assert.equal(fixture.heap.get(receiver).type, CONCURRENT_MAP);
});

test("AbstractMap constructor rejects unrelated and non-reference receivers", () => {
	const fixture = createFixture();
	for (const receiver of [
		0,
		fixture.heap.allocate(JAVA_OBJECT)
	]) {
		assert.throws(
			() => fixture.family.invoke(constructorRecord(), [receiver]),
			error => error.code === "ANDROID_JAVA_ABSTRACT_MAP_RECEIVER_REQUIRED"
		);
	}
});

test("AbstractMap family handles only the exact constructor signature", () => {
	const fixture = createFixture();
	const entrySet = record("entrySet", "()Ljava/util/Set;");
	assert.equal(fixture.family.canHandle(constructorRecord()), true);
	assert.equal(fixture.family.canHandle(entrySet), false);
	assert.throws(
		() => fixture.family.invoke(entrySet, [fixture.heap.allocate(CONCURRENT_MAP)]),
		error => error.code === "ANDROID_JAVA_ABSTRACT_MAP_METHOD_UNSUPPORTED"
	);
	const families = createFrameworkJavaValueFamilies(fixture.runtime);
	assert.equal(
		families.filter(family => family.canHandle(constructorRecord())).length,
		1
	);
	assert.equal(
		families.filter(family => family.canHandle(entrySet)).length,
		0
	);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const parents = new Map([
		[CONCURRENT_MAP, ABSTRACT_MAP],
		[ABSTRACT_MAP, JAVA_OBJECT]
	]);
	const runtime = {
		heap,
		registry: {
			classDefinition(type) {
				if (!parents.has(type)) return null;
				return {
					interfaces: [],
					superType: parents.get(type),
					type
				};
			},
			superType(type) {
				return parents.get(type) || null;
			}
		}
	};
	return {
		family: createFrameworkJavaAbstractMapConstructorMethods(runtime),
		heap,
		runtime
	};
}

function constructorRecord() {
	return record("<init>", "()V");
}

function record(name, descriptor) {
	return {
		method: { classType: ABSTRACT_MAP, descriptor, name },
		signature: `${ABSTRACT_MAP}->${name}${descriptor}`
	};
}
