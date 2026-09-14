//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkFlutterNativeMachineOptions } from "../core/android/frameworkFlutterNativeMachineOptions.js";
import {
	readJavaByte,
	writeJavaByte
} from "../core/android/frameworkJavaByteBufferAccess.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { registerFlutterJniReferenceHandlers } from "../core/native/flutterJniReferenceHandlers.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createByteBufferFixture } from "./byteBufferFixture.mjs";

const ENVIRONMENT = 0x5000n;
const RETURN = 0x7777n;
const ADDRESS = 0x1000n;

/**
 * Proves JNI NewDirectByteBuffer is one genuine Java/native shared-memory alias.
 * Native writes become Java reads, Java writes become native reads, and JNI queries
 * retain the original guest pointer and capacity without copying any payload bytes.
 */
test("JNI direct ByteBuffer aliases guest memory through Java methods", () => {
	const fixture = createDirectBufferFixture();
	const created = invoke(fixture, "JNINativeInterface.NewDirectByteBuffer", [
		ENVIRONMENT,
		ADDRESS,
		8n
	]);
	const handle = fixture.registers.read(0, 64, "zero");
	const target = fixture.references.find(handle).target;
	assert.equal(created.result.capacity, 8);
	fixture.memory.write(ADDRESS + 1n, Uint8Array.of(0x7a));
	assert.equal(readJavaByte(fixture.runtime, target, 1), 0x7a);
	writeJavaByte(fixture.runtime, target, 2, 0x55);
	assert.equal(fixture.memory.read(ADDRESS + 2n, 1)[0], 0x55);
	invoke(fixture, "JNINativeInterface.GetDirectBufferAddress", [
		ENVIRONMENT,
		handle
	]);
	assert.equal(fixture.registers.read(0, 64, "zero"), ADDRESS);
	invoke(fixture, "JNINativeInterface.GetDirectBufferCapacity", [
		ENVIRONMENT,
		handle
	]);
	assert.equal(fixture.registers.read(0, 64, "zero"), 8n);
});

/** Proves non-direct objects retain JNI's null-address and negative-capacity sentinels. */
test("JNI direct-buffer queries reject ordinary jobject storage", () => {
	const fixture = createDirectBufferFixture();
	const ordinary = fixture.references.create(
		"object",
		"Lexample/Ordinary;#1",
		Object.freeze({ ordinary: true }),
		{ scope: "local" }
	);
	invoke(fixture, "JNINativeInterface.GetDirectBufferAddress", [
		ENVIRONMENT,
		ordinary
	]);
	assert.equal(fixture.registers.read(0, 64, "zero"), 0n);
	invoke(fixture, "JNINativeInterface.GetDirectBufferCapacity", [
		ENVIRONMENT,
		ordinary
	]);
	assert.equal(
		BigInt.asIntN(64, fixture.registers.read(0, 64, "zero")),
		-1n
	);
});

/** Builds one JNI + Android ByteBuffer fixture with a shared mapped native span. */
function createDirectBufferFixture() {
	const java = createByteBufferFixture();
	const memory = createNativeAnonymousMemory(ADDRESS, 64, "direct-buffer-test");
	const references = createJniGuestReferences();
	const registry = createNativeHostImportRegistry();
	const options = createFrameworkFlutterNativeMachineOptions(
		java.runtime,
		Object.freeze({}),
		Object.freeze({ resolveClass() {}, resolveField() {}, resolveMethod() {} }),
		Object.freeze({}),
		Object.freeze({})
	);
	registerFlutterJniReferenceHandlers(registry, {
		createDirectByteBuffer: options.createDirectByteBuffer,
		jniEnvironment: Object.freeze({ environmentAddress: ENVIRONMENT.toString() }),
		jniReferences: references,
		memory
	});
	return Object.freeze({
		memory,
		references,
		registers: createAarch64Registers(),
		registry,
		runtime: java.runtime
	});
}

function invoke(fixture, name, args) {
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(30, RETURN, 64, "zero");
	args.forEach((value, index) => {
		fixture.registers.write(index, value, 64, "zero");
	});
	const handled = fixture.registry.handle(
		Object.freeze({ name }),
		Object.freeze({ registers: fixture.registers })
	);
	assert.equal(handled.handled, true);
	assert.equal(fixture.registers.pc, RETURN);
	return handled;
}
