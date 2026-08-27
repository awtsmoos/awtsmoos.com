//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { registerFlutterJniArrayHandlers } from "../core/native/flutterJniArrayHandlers.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";
import { jniNativeInterfaceSlotName } from "../core/native/jniNativeInterfaceNames.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

const JNI_ENVIRONMENT = 0x5000n;
const JNI_RETURN_ADDRESS = 0x7777n;

/**
 * Proves authentic opaque JNI array handles delegate to the live Dalvik heap.
 * The Awtsmoos recreates array, handle, length, and return shore in one test;
 * Awtsmoos.com keeps guest references opaque while heap truth remains supreme.
 */
test("JNI GetArrayLength returns a Dalvik String array length", () => {
	const fixture = createArrayFixture(3);
	const handled = invokeGetArrayLength(fixture, fixture.handle);
	assert.equal(handled.handled, true);
	assert.equal(handled.result.operation, "GetArrayLength");
	assert.equal(handled.result.length, 3);
	assert.equal(fixture.registers.read(0, 64, "zero"), 3n);
	assert.equal(fixture.registers.pc, JNI_RETURN_ADDRESS);
	assert.equal(jniNativeInterfaceSlotName(171), "GetArrayLength");
});

test("JNI GetArrayLength preserves zero length and rejects invalid handles", () => {
	const empty = createArrayFixture(0);
	invokeGetArrayLength(empty, empty.handle);
	assert.equal(empty.registers.read(0, 64, "zero"), 0n);
	const missing = createArrayFixture(1);
	assert.throws(
		() => invokeGetArrayLength(missing, 0x1234n),
		error => error.code === "JNI_REFERENCE_HANDLE"
	);
});

test("JNI GetArrayLength delegates non-array validation to the heap", () => {
	const fixture = createObjectFixture();
	assert.throws(
		() => invokeGetArrayLength(fixture, fixture.handle),
		error => error.code === "DALVIK_ARRAY_REQUIRED"
	);
});

function createArrayFixture(length) {
	const heap = createDalvikObjectHeap();
	const target = heap.allocateArray("[Ljava/lang/String;", length);
	return createFixture(heap, target, "string-array");
}

function createObjectFixture() {
	const heap = createDalvikObjectHeap();
	const target = heap.allocate("Ljava/lang/Object;");
	return createFixture(heap, target, "plain-object");
}

function createFixture(heap, target, identity) {
	const references = createJniGuestReferences();
	const handle = references.intern("object", identity, target, {
		scope: "local"
	});
	const registry = createNativeHostImportRegistry();
	registerFlutterJniArrayHandlers(registry, {
		jniEnvironment: Object.freeze({
			environmentAddress: JNI_ENVIRONMENT.toString()
		}),
		jniReferences: references,
		resolveArrayLength(reference) {
			return heap.arrayLength(reference);
		}
	});
	return Object.freeze({
		handle,
		registers: createAarch64Registers(),
		registry
	});
}

function invokeGetArrayLength(fixture, handle) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, JNI_ENVIRONMENT);
	fixture.registers.write(1, handle);
	fixture.registers.write(30, JNI_RETURN_ADDRESS);
	return fixture.registry.handle(
		Object.freeze({ name: "JNINativeInterface.GetArrayLength" }),
		Object.freeze({ registers: fixture.registers })
	);
}
