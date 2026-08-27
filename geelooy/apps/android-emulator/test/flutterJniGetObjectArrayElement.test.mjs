//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { createFrameworkFlutterNativeArrayResolver } from "../core/android/frameworkFlutterNativeArrayElements.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { registerFlutterJniObjectArrayHandlers } from "../core/native/flutterJniObjectArrayHandlers.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";
import { jniNativeInterfaceSlotName } from "../core/native/jniNativeInterfaceNames.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

const ENVIRONMENT = 0x5000n;
const RETURN_ADDRESS = 0x7777n;

/**
 * Proves object-array elements remain opaque while real heap values return.
 * The Awtsmoos recreates string, object, null, local handle, and return shore;
 * Awtsmoos.com preserves Dalvik ownership without host-pointer masquerade.
 */
test("GetObjectArrayElement returns an authentic String element", () => {
	const fixture = createFixture("[Ljava/lang/String;", 2);
	fixture.heap.arraySet(fixture.array, 0, "alpha");
	const first = invoke(fixture, 0);
	const firstReference = fixture.references.find(first.result.resultHandle);
	assert.equal(firstReference.kind, "string");
	assert.equal(firstReference.scope, "local");
	assert.equal(firstReference.target, "alpha");
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
	assert.equal(jniNativeInterfaceSlotName(173), "GetObjectArrayElement");
	const second = invoke(fixture, 0);
	const secondReference = fixture.references.find(second.result.resultHandle);
	assert.notEqual(first.result.resultHandle, second.result.resultHandle);
	assert.equal(firstReference.target, secondReference.target);
});

test("GetObjectArrayElement returns Dalvik objects and null", () => {
	const fixture = createFixture("[Ljava/lang/Object;", 2);
	const object = fixture.heap.allocate("Ljava/lang/Object;");
	fixture.heap.arraySet(fixture.array, 0, object);
	const objectResult = invoke(fixture, 0);
	const objectReference = fixture.references.find(
		objectResult.result.resultHandle
	);
	assert.equal(objectReference.target, object);
	assert.equal(objectReference.metadata.dalvikType, "Ljava/lang/Object;");
	const nullResult = invoke(fixture, 1);
	assert.equal(nullResult.result.resultHandle, "0");
	assert.equal(fixture.registers.read(0, 64, "zero"), 0n);
});

test("GetObjectArrayElement preserves heap and handle failures", () => {
	const fixture = createFixture("[Ljava/lang/String;", 1);
	assert.throws(
		() => invoke(fixture, -1),
		error => error.code === "DALVIK_ARRAY_INDEX"
	);
	assert.throws(
		() => invoke(fixture, 1),
		error => error.code === "DALVIK_ARRAY_INDEX"
	);
	fixture.registers.write(1, 0x1234n, 64, "zero");
	fixture.registers.write(2, 0n, 32, "zero");
	assert.throws(
		() => fixture.registry.handle(importRecord(), context(fixture)),
		error => error.code === "JNI_REFERENCE_HANDLE"
	);
});

function createFixture(type, length) {
	const heap = createDalvikObjectHeap();
	const array = heap.allocateArray(type, length);
	const references = createJniGuestReferences();
	const arrayHandle = references.create("object", `${type}#fixture`, array);
	const registry = createNativeHostImportRegistry();
	registerFlutterJniObjectArrayHandlers(registry, {
		...createFrameworkFlutterNativeArrayResolver({ heap }),
		jniEnvironment: Object.freeze({ environmentAddress: ENVIRONMENT.toString() }),
		jniReferences: references
	});
	return { array, arrayHandle, heap, references,
		registers: createAarch64Registers(), registry };
}

function invoke(fixture, index) {
	fixture.registers.write(0, ENVIRONMENT, 64, "zero");
	fixture.registers.write(1, fixture.arrayHandle, 64, "zero");
	fixture.registers.write(2, BigInt.asUintN(32, BigInt(index)), 32, "zero");
	fixture.registers.write(30, RETURN_ADDRESS, 64, "zero");
	return fixture.registry.handle(importRecord(), context(fixture));
}

function importRecord() {
	return Object.freeze({ name: "JNINativeInterface.GetObjectArrayElement" });
}

function context(fixture) {
	return Object.freeze({ registers: fixture.registers });
}
