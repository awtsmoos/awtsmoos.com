//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkFlutterNativeArrayResolver } from "../core/android/frameworkFlutterNativeArrayElements.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { registerFlutterJniObjectArrayHandlers } from "../core/native/flutterJniObjectArrayHandlers.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";
import { jniNativeInterfaceSlotName } from "../core/native/jniNativeInterfaceNames.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

const ENVIRONMENT = 0x5000n;
const RETURN_ADDRESS = 0x7777n;

/**
 * Proves NewObjectArray, SetObjectArrayElement, and GetObjectArrayElement share
 * one Android-owned Dalvik array while JNI handles remain thread-local wrappers.
 */
test("JNI object arrays construct mutate and retrieve real Dalvik targets", () => {
	const fixture = createFixture();
	const object = fixture.heap.allocate("Ljava/lang/Object;");
	const objectHandle = fixture.references.create("object", "object#1", object);
	const created = invoke(fixture, "NewObjectArray", [3n, fixture.classHandle, objectHandle]);
	const arrayHandle = BigInt(created.result.handle);
	const arrayReference = fixture.references.find(arrayHandle);
	assert.equal(arrayReference.scope, "local");
	assert.equal(fixture.heap.arrayLength(arrayReference.target), 3);

	assert.equal(fixture.heap.arrayGet(arrayReference.target, 2), object);
	const retrieved = invoke(fixture, "GetObjectArrayElement", [arrayHandle, 1n]);
	const retrievedReference = fixture.references.find(
		BigInt(retrieved.result.resultHandle)
	);
	assert.equal(retrievedReference.target, object);
	invoke(fixture, "SetObjectArrayElement", [arrayHandle, 1n, 0n]);
	assert.equal(fixture.heap.arrayGet(arrayReference.target, 1), 0);
	assert.equal(jniNativeInterfaceSlotName(172), "NewObjectArray");
	assert.equal(jniNativeInterfaceSlotName(174), "SetObjectArrayElement");
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
});

/**
 * Proves object-array handlers reject invalid length and primitive-array mutation.
 */
test("JNI object arrays reject invalid construction and primitive targets", () => {
	const fixture = createFixture();
	assert.throws(
		() => invoke(fixture, "NewObjectArray", [0xffffffffn, fixture.classHandle, 0n]),
		error => error.code === "JNI_OBJECT_ARRAY_LENGTH"
	);
	const primitive = fixture.heap.allocateArray("[I", 1);
	const primitiveHandle = fixture.references.create("object", "[I#fixture", primitive);
	assert.throws(
		() => invoke(fixture, "SetObjectArrayElement", [primitiveHandle, 0n, 0n]),
		error => error.code === "JNI_OBJECT_ARRAY_TYPE"
	);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const references = createJniGuestReferences();
	const resolver = createFrameworkFlutterNativeArrayResolver({ heap });
	const registry = createNativeHostImportRegistry();
	const classHandle = references.create("class", "Ljava/lang/Object;");
	registerFlutterJniObjectArrayHandlers(registry, {
		...resolver,
		jniArrayCapabilities: resolver,
		jniEnvironment: Object.freeze({ environmentAddress: ENVIRONMENT.toString() }),
		jniReferences: references
	});
	return {
		classHandle,
		heap,
		references,
		registers: createAarch64Registers(),
		registry
	};
}

function invoke(fixture, name, argumentsList) {
	fixture.registers.write(0, ENVIRONMENT, 64, "zero");
	argumentsList.forEach((value, index) => {
		fixture.registers.write(index + 1, value, 64, "zero");
	});
	fixture.registers.write(30, RETURN_ADDRESS, 64, "zero");
	return fixture.registry.handle(Object.freeze({
		name: `JNINativeInterface.${name}`
	}), Object.freeze({ registers: fixture.registers }));
}
