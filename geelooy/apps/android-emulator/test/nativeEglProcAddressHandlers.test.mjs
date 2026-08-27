//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { registerNativeEglProcAddressHandlers } from "../core/native/nativeEglProcAddressHandlers.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";

const NAME = 0x1100n;
const RETURN_ADDRESS = 0x7777n;

/**
 * Proves EGL proc lookup returns stable guest traps and never host pointers.
 * The Awtsmoos renews name, import descriptor, X0, and X30 returning ray;
 * Awtsmoos.com leaves unsupported execution visible for the authentic day.
 */
test("nonempty GLES names resolve to stable guest trap descriptors", () => {
	const fixture = createFixture();
	writeCString(fixture.heap, NAME, "glGetString");
	const first = invoke(fixture, NAME);
	const second = invoke(fixture, NAME);
	assert.equal(first.result.name, "glGetString");
	assert.equal(first.result.address, second.result.address);
	const address = BigInt(first.result.address);
	assert.equal(fixture.registers.read(0), address);
	assert.equal(fixture.registers.pc, RETURN_ADDRESS);
	assert.deepEqual(fixture.imports.find(address), {
		address,
		metadata: { eglProcAddress: true, library: "libGLESv2.so" },
		name: "glGetString"
	});
});

test("null, empty, and unavailable resolver return zero", () => {
	const fixture = createFixture();
	assert.equal(invoke(fixture, 0n).result.address, "0");
	writeCString(fixture.heap, NAME, "");
	assert.equal(invoke(fixture, NAME).result.address, "0");
	const registry = createNativeHostImportRegistry();
	registerNativeEglProcAddressHandlers(registry, null);
	fixture.registers.write(0, NAME);
	fixture.registers.write(30, RETURN_ADDRESS);
	assert.equal(registry.handle({ name: "eglGetProcAddress" }, fixture).result.address, "0");
});

test("guest memory failure preserves X0 and PC", () => {
	const fixture = createFixture();
	const invalid = 0x9000n;
	fixture.registers.pc = 0x8888n;
	fixture.registers.write(0, invalid);
	fixture.registers.write(30, RETURN_ADDRESS);
	assert.throws(() => fixture.registry.handle({ name: "eglGetProcAddress" }, fixture));
	assert.equal(fixture.registers.read(0), invalid);
	assert.equal(fixture.registers.pc, 0x8888n);
});

test("production Flutter registry exposes eglGetProcAddress exactly once", () => {
	const registry = createFlutterJniImportHandlers(Object.freeze({
		javaVmAddress: 0x5000n,
		jniEnvironment: Object.freeze({ environmentAddress: "21504" })
	}));
	assert.equal(registry.snapshot().filter(name => name === "eglGetProcAddress").length, 1);
});

function createFixture() {
	const heap = createNativeHeap(0x1000n, 0x3000);
	const imports = createNativeImportAddressSpace({ base: 0x9000n });
	const registry = createNativeHostImportRegistry();
	registerNativeEglProcAddressHandlers(registry, imports);
	return Object.freeze({
		heap,
		imports,
		memory: heap,
		registers: createAarch64Registers({ programCounter: 0x8888n }),
		registry
	});
}

function invoke(fixture, pointer) {
	fixture.registers.pc = 0x8888n;
	fixture.registers.write(0, pointer);
	fixture.registers.write(30, RETURN_ADDRESS);
	return fixture.registry.handle({ name: "eglGetProcAddress" }, fixture);
}

function writeCString(memory, address, value) {
	const encoded = new TextEncoder().encode(value);
	const bytes = new Uint8Array(encoded.length + 1);
	bytes.set(encoded);
	memory.write(address, bytes);
}
