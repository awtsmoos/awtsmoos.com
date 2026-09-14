//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { registerFlutterJniStringHandlers } from "../core/native/flutterJniStringHandlers.js";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";
import { jniNativeInterfaceSlotName } from "../core/native/jniNativeInterfaceNames.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";

const ENVIRONMENT = 0x4000n;
const RETURN_ADDRESS = 0x7777n;
const THREAD_KEY = 0xabcn;

/** Proves NewString preserves Java UTF-16 units and creates fresh local identity. */
test("NewString creates fresh TLS-owned UTF-16 Java references", () => {
	const fixture = createFixture();
	const pointer = fixture.heap.allocate(10n);
	fixture.heap.write(pointer, Uint8Array.from([
		0x41, 0x00,
		0x00, 0x00,
		0x3d, 0xd8,
		0x00, 0xde,
		0x42, 0x00
	]));
	const first = invokeNewString(fixture, pointer, 5n);
	const second = invokeNewString(fixture, pointer, 5n);

	assert.notEqual(first, second);
	const reference = fixture.references.find(first);
	assert.equal(reference.target, "A\u0000😀B");
	assert.equal(reference.metadata.descriptor, "Ljava/lang/String;");
	assert.equal(reference.scope, "local");
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
	assert.equal(jniNativeInterfaceSlotName(163), "NewString");
	const frames = fixture.references.frameSnapshot();
	assert.ok(JSON.stringify(frames).includes(THREAD_KEY.toString()));
});

/** Proves zero-length creation is valid while negative jsize is rejected. */
test("NewString accepts empty text and rejects negative lengths", () => {
	const fixture = createFixture();
	const emptyHandle = invokeNewString(fixture, 0n, 0n);
	assert.equal(fixture.references.find(emptyHandle).target, "");
	assert.throws(
		() => invokeNewString(fixture, 0n, 0xffffffffn),
		error => error.code === "JNI_NEW_STRING_LENGTH"
	);
});

/** Creates a bounded JNI string fixture with one explicit root TLS identity. */
function createFixture() {
	const heap = createNativeHeap(0x10000n, 0x4000);
	const references = createJniGuestReferences();
	const registers = createAarch64Registers();
	const registry = createNativeHostImportRegistry();
	registerFlutterJniStringHandlers(registry, {
		jniEnvironment: Object.freeze({
			environmentAddress: ENVIRONMENT.toString()
		}),
		jniReferences: references,
		nativeHeap: heap,
		resolveStringValue(target) {
			return target;
		},
		systemRegisters: Object.freeze({
			read(name) {
				assert.equal(name, "TPIDR_EL0");
				return THREAD_KEY;
			}
		})
	});
	return Object.freeze({ heap, references, registers, registry });
}

/** Executes one authentic ARM64-shaped NewString JNI import. */
function invokeNewString(fixture, pointer, length) {
	fixture.registers.write(0, ENVIRONMENT, 64, "zero");
	fixture.registers.write(1, pointer, 64, "zero");
	fixture.registers.write(2, length, 64, "zero");
	fixture.registers.write(30, RETURN_ADDRESS, 64, "zero");
	fixture.registry.handle(
		Object.freeze({ name: "JNINativeInterface.NewString" }),
		Object.freeze({ memory: fixture.heap, registers: fixture.registers })
	);
	return fixture.registers.read(0, 64, "zero");
}
