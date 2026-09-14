//B"H
//Boruch Hashem
//Blessed be He

/**
 * @fileoverview Reusable AArch64 fixture for JNI Call<Type>Method family tests.
 * The Awtsmoos renews JNIEnv identity, JNI references, method IDs, register state,
 * guest memory, and ABI vessels anew so tests witness native semantics directly.
 */

import assert from "node:assert/strict";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { writeAarch64Integer } from "../core/native/aarch64MemoryInteger.js";
import { registerFlutterJniCallMethodHandlers } from "../core/native/flutterJniCallMethodHandlers.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";
import { createJniMethodIds } from "../core/native/jniMethodIds.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

export const ENVIRONMENT = 0x5000n;
export const RETURN_ADDRESS = 0x7777n;
const CLASS = "Lexample/JniCall;";

/**
 * Creates one isolated JNI instance-method fixture for an exact descriptor.
 * @param {string} signature Java method descriptor used to intern the jmethodID.
 * @returns {object} Frozen guest memory, handles, registers, references, and registry.
 */
export function createCallFixture(signature) {
	const memory = createNativeAnonymousMemory(0x5000n, 0x3000, "jni-call-test");
	const references = createJniGuestReferences();
	const receiver = references.create("object", "receiver", Object.freeze({ id: 1 }), {
		scope: "local"
	});
	const methodIds = createJniMethodIds();
	const method = methodIds.intern({
		classDescriptor: CLASS,
		name: "work",
		signature,
		static: false,
		target: Object.freeze({
			method: Object.freeze({
				classType: CLASS,
				descriptor: signature,
				name: "work"
			})
		})
	});
	const machineState = Object.freeze({
		jniEnvironment: Object.freeze({ environmentAddress: ENVIRONMENT.toString() }),
		jniMethodIds: methodIds,
		jniReferences: references
	});
	const registry = createNativeHostImportRegistry();
	registerFlutterJniCallMethodHandlers(registry, machineState);
	return Object.freeze({
		memory,
		method,
		receiver,
		references,
		registers: createAarch64Registers(),
		registry
	});
}

/** Places the fixed JNIEnv, receiver, method ID, and native return address. */
export function primeVirtualCall(fixture) {
	fixture.registers.write(0, ENVIRONMENT);
	fixture.registers.write(1, fixture.receiver);
	fixture.registers.write(2, fixture.method);
	fixture.registers.write(30, RETURN_ADDRESS);
}

/** Invokes one named JNI import and returns its bounded Java-call request. */
export function invokeCall(fixture, name) {
	const handled = fixture.registry.handle(
		Object.freeze({ name: `JNINativeInterface.${name}` }),
		Object.freeze({
			memory: fixture.memory,
			registers: fixture.registers
		})
	);
	assert.equal(handled.handled, true);
	assert.equal(handled.result.machineControl.reason, "jni-java-call");
	return handled.result.jniCall;
}

/** Seeds a va_list whose two GP save slots hold a long and signed int. */
export function seedGeneralVaList(memory, address) {
	initializeVaList(memory, address, 0x6400n, 0x6600n, -16, 0x6800n, 0);
	writeAarch64Integer(memory, 0x65f0n, 0x1122334455667788n, 64);
	writeAarch64Integer(memory, 0x65f8n, 0xfffffffen, 32);
}

/** Seeds Android's 32-byte AArch64 va_list with explicit save-area geometry. */
function initializeVaList(memory, address, stack, generalTop, generalOffset, vectorTop, vectorOffset) {
	writeAarch64Integer(memory, address, stack, 64);
	writeAarch64Integer(memory, address + 8n, generalTop, 64);
	writeAarch64Integer(memory, address + 16n, vectorTop, 64);
	writeAarch64Integer(
		memory,
		address + 24n,
		BigInt.asUintN(32, BigInt(generalOffset)),
		32
	);
	writeAarch64Integer(
		memory,
		address + 28n,
		BigInt.asUintN(32, BigInt(vectorOffset)),
		32
	);
}

/** Writes one little-endian 32-bit floating value into guest memory. */
export function writeFloat32(memory, address, value) {
	const bytes = new Uint8Array(4);
	new DataView(bytes.buffer).setFloat32(0, value, true);
	memory.write(address, bytes);
}
