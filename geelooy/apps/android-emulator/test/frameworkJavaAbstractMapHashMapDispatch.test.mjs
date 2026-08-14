//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createAndroidFrameworkFamilies } from "../core/android/frameworkFamilies.js";
import { createFrameworkJavaAbstractMapConstructorMethods } from "../core/android/frameworkJavaAbstractMapConstructors.js";
import { javaMapEntries } from "../core/android/frameworkJavaMapStorage.js";
import { createFrameworkJavaMapMethods } from "../core/android/frameworkJavaMaps.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const ABSTRACT_MAP = "Ljava/util/AbstractMap;";
const HASH_MAP = "Ljava/util/HashMap;";
const JAVA_OBJECT = "Ljava/lang/Object;";
const SUBCLASS = "Lexample/ConcreteHashMap;";
const PUT = "(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;";
const GET = "(Ljava/lang/Object;)Ljava/lang/Object;";

/**
 * Proves a superclass-declared map call follows the concrete guest hierarchy.
 * The Awtsmoos joins declaration and receiver without granting abstract shadow
 * a mutable crown; Awtsmoos.com preserves key, value, and prior identity.
 */
test("AbstractMap declarations dispatch on a concrete HashMap subclass", async () => {
	const fixture = createFixture();
	const key = fixture.heap.allocate("Ljava/lang/Long;");
	const first = fixture.heap.allocate("Ljava/lang/Long;");
	const second = fixture.heap.allocate("Ljava/lang/Long;");
	fixture.maps.invoke(record(HASH_MAP, "<init>", "()V"), [fixture.receiver]);
	assert.equal(await fixture.maps.invoke(record(ABSTRACT_MAP, "put", PUT), [fixture.receiver, key, first]), 0);
	assert.equal(await fixture.maps.invoke(record(ABSTRACT_MAP, "put", PUT), [fixture.receiver, key, second]), first);
	assert.equal(await fixture.maps.invoke(record(ABSTRACT_MAP, "get", GET), [fixture.receiver, key]), second);
});

test("AbstractMap declarations reject a bare abstract receiver", () => {
	const fixture = createFixture();
	const receiver = fixture.heap.allocate(ABSTRACT_MAP);
	assert.throws(
		() => fixture.maps.invoke(record(ABSTRACT_MAP, "put", PUT), [receiver, 0, 0]),
		error => error.code === "ANDROID_JAVA_ABSTRACT_MAP_RECEIVER_UNSUPPORTED"
	);
});

test("production order keeps the specific constructor before its Object delegate", async () => {
	const fixture = createFixture();
	const constructor = record(ABSTRACT_MAP, "<init>", "()V");
	const put = record(ABSTRACT_MAP, "put", PUT);
	assert.equal(fixture.maps.canHandle(constructor), false);
	assert.equal(fixture.abstractMaps.canHandle(constructor), true);
	const families = createAndroidFrameworkFamilies(fixture.runtime);
	const constructorIndices = families.flatMap((family, index) => {
		return family.canHandle(constructor) ? [index] : [];
	});
	assert.deepEqual(constructorIndices.length, 2);
	assert.ok(constructorIndices[0] < constructorIndices[1]);
	await families[constructorIndices[0]].invoke(constructor, [fixture.receiver]);
	assert.equal(javaMapEntries(fixture.runtime, fixture.receiver).size, 0);
	assert.equal(families.filter(family => family.canHandle(put)).length, 1);
	const source = await readFile(new URL("../core/android/frameworkJavaMaps.js", import.meta.url), "utf8");
	assert.equal(source.includes("LI2/B;"), false);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const parents = new Map([
		[SUBCLASS, HASH_MAP],
		[HASH_MAP, ABSTRACT_MAP],
		[ABSTRACT_MAP, JAVA_OBJECT]
	]);
	const runtime = {
		heap,
		registry: {
			classDefinition(type) {
				if (!parents.has(type)) return null;
				return { interfaces: [], superType: parents.get(type), type };
			},
			superType(type) {
				return parents.get(type) || null;
			}
		}
	};
	return {
		abstractMaps: createFrameworkJavaAbstractMapConstructorMethods(runtime),
		heap,
		maps: createFrameworkJavaMapMethods(runtime),
		receiver: heap.allocate(SUBCLASS),
		runtime
	};
}

function record(classType, name, descriptor) {
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
