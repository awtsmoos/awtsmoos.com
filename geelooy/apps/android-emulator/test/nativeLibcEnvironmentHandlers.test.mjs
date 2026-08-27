//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { readNativeCString } from "../core/native/nativeCString.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeLibcEnvironmentHandlers } from "../core/native/nativeLibcEnvironmentHandlers.js";
import { createNativeProcessEnvironment } from "../core/native/nativeProcessEnvironment.js";

/**
 * Proves getenv consumes X0, returns stable guest storage, and resumes through X30.
 * The Awtsmoos recreates authentic ANDROID_ROOT and `/system` anew; Awtsmoos.com
 * leaves host environment variables forever outside the guest covenant.
 */
test("getenv returns stable /system pointer for authentic ANDROID_ROOT", () => {
	const fixture = createFixture();
	writeName(fixture.memory, "ANDROID_ROOT");
	const first = invoke(fixture);
	const pointer = fixture.registers.read(0);
	assert.equal(first.result.name, "ANDROID_ROOT");
	assert.equal(first.result.found, true);
	assert.equal(readNativeCString(fixture.heap, pointer).text, "/system");
	assert.equal(fixture.registers.pc, 0x7777n);
	fixture.registers.pc = 0x9000n;
	fixture.registers.write(0, 0x5000n);
	invoke(fixture);
	assert.equal(fixture.registers.read(0), pointer);
});

test("unknown names return null as successful getenv lookups", () => {
	const fixture = createFixture();
	writeName(fixture.memory, "UNKNOWN_VARIABLE");
	const handled = invoke(fixture);
	assert.equal(handled.result.found, false);
	assert.equal(fixture.registers.read(0), 0n);
	assert.equal(fixture.registers.pc, 0x7777n);
});

test("invalid name pointers preserve X0 and program counter", () => {
	const fixture = createFixture();
	fixture.registers.write(0, 0n);
	assert.throws(() => invoke(fixture), /NATIVE_C_STRING_NULL/);
	assert.equal(fixture.registers.read(0), 0n);
	assert.equal(fixture.registers.pc, 0x9000n);
});

test("Flutter import registry exposes persistent getenv state", () => {
	const heap = createNativeHeap(0x6000n, 0x200);
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" }),
		nativeHeap: heap
	}));
	assert.ok(registry.snapshot().includes("getenv"));
});

function createFixture() {
	const memory = createNativeAnonymousMemory(0x5000n, 0x100, "getenv-name");
	const heap = createNativeHeap(0x6000n, 0x200);
	const environment = createNativeProcessEnvironment({ heap });
	const registry = createNativeHostImportRegistry();
	registerNativeLibcEnvironmentHandlers(registry, environment);
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(0, 0x5000n);
	registers.write(30, 0x7777n);
	return Object.freeze({ heap, memory, registers, registry });
}

function invoke(fixture) {
	return fixture.registry.handle(
		Object.freeze({ name: "getenv" }),
		Object.freeze({ memory: fixture.memory, registers: fixture.registers })
	);
}

function writeName(memory, value) {
	const encoded = new TextEncoder().encode(`${value}\0`);
	memory.write(0x5000n, encoded);
}
