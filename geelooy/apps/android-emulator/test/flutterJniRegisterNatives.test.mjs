//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { handleFlutterJniRegisterNatives } from "../core/native/flutterJniRegisterNatives.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";
import { createJniNativeMethodRegistry } from "../core/native/jniNativeMethodRegistry.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";

/**
 * Proves RegisterNatives commits a whole class-scoped batch and resumes through
 * the guest link register. The Awtsmoos recreates table, class handle, ARM64
 * address, and JNI result anew; Awtsmoos.com leaves invalid context unregistered.
 */
test("RegisterNatives commits parsed methods and returns JNI_OK", () => {
	const fixture = createRegistrationFixture();
	const result = handleFlutterJniRegisterNatives(
		fixture.context,
		fixture.machineState
	);
	assert.equal(result.success, true);
	assert.equal(result.returnCode, 0);
	assert.equal(result.count, 2);
	assert.equal(fixture.registers.read(0, 32), 0n);
	assert.equal(fixture.registers.pc, 0x7777n);
	assert.equal(
		fixture.registry.lookup(
			"Lexample/Test;",
			"nativeInit",
			"()V"
		).functionAddress,
		0x1000n
	);
});

test("RegisterNatives rejects invalid class handle without mutation", () => {
	const fixture = createRegistrationFixture();
	fixture.registers.write(1, 0xdeadn);
	const result = handleFlutterJniRegisterNatives(
		fixture.context,
		fixture.machineState
	);
	assert.equal(result.success, false);
	assert.equal(result.returnCode, -1);
	assert.equal(fixture.registers.read(0, 32), 0xffffffffn);
	assert.equal(fixture.registry.snapshot().length, 0);
	assert.equal(fixture.registers.pc, 0x7777n);
});

function createRegistrationFixture() {
	const region = createNativeAnonymousMemory(0x5000n, 0x2000, "jni-test");
	const memory = createNativeCompositeMemory(faultingPrimary(), [region]);
	writeMethodTable(memory, region);
	const references = createJniGuestReferences();
	const classHandle = references.intern(
		"class",
		"Lexample/Test;",
		Object.freeze({ type: "Lexample/Test;" })
	);
	const registry = createJniNativeMethodRegistry();
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(0, 0x5000n);
	registers.write(1, classHandle);
	registers.write(2, 0x5100n);
	registers.write(3, 2n, 32);
	registers.write(30, 0x7777n);
	return Object.freeze({
		context: Object.freeze({ memory, registers }),
		machineState: Object.freeze({
			jniEnvironment: Object.freeze({ environmentAddress: "20480" }),
			jniNativeMethods: registry,
			jniReferences: references
		}),
		registers,
		registry
	});
}

function writeMethodTable(memory, region) {
	writeString(region, 0x5800n, "nativeInit");
	writeString(region, 0x5820n, "()V");
	writeString(region, 0x5840n, "nativeOther");
	writeString(region, 0x5860n, "(I)J");
	const values = [0x5800n, 0x5820n, 0x1000n, 0x5840n, 0x5860n, 0x2000n];
	values.forEach((value, index) => {
		memory.writeU64(0x5100n + BigInt(index * 8), value);
	});
}

function writeString(region, address, text) {
	region.write(address, new Uint8Array([...new TextEncoder().encode(text), 0]));
}

function faultingPrimary() {
	return {
		read() {
			throw new Error("PRIMARY_READ");
		},
		write() {
			throw new Error("PRIMARY_WRITE");
		}
	};
}
