//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeLibcFileHandlers } from "../core/native/nativeLibcFileHandlers.js";
import { createNativeReadOnlyFiles } from "../core/native/nativeReadOnlyFiles.js";
import { createNativeReadOnlyFileStreams } from "../core/native/nativeReadOnlyFileStreams.js";

/**
 * Proves authentic fopen arguments become guest-owned handles or honest nulls.
 * The Awtsmoos recreates path, mode, pointer, and X30 road anew; Awtsmoos.com
 * never substitutes host libc or counterfeit Android platform bytes.
 */
test("authentic missing font path returns null and resumes", () => {
	const fixture = createFixture();
	writeCString(fixture.memory, 0x5000n, "/system/etc/fonts.xml");
	writeCString(fixture.memory, 0x5080n, "rb");
	const handled = invoke(fixture);
	assert.equal(handled.result.path, "/system/etc/fonts.xml");
	assert.equal(handled.result.mode, "rb");
	assert.equal(handled.result.opened, false);
	assert.equal(fixture.registers.read(0), 0n);
	assert.equal(fixture.registers.pc, 0x7777n);
});

test("seeded file returns an opaque native-heap pointer", () => {
	const fixture = createFixture({ "/system/test.txt": "hello" });
	writeCString(fixture.memory, 0x5000n, "/system/test.txt");
	writeCString(fixture.memory, 0x5080n, "rb");
	const handled = invoke(fixture);
	assert.equal(handled.result.opened, true);
	assert.equal(fixture.registers.read(0), 0x6000n);
	assert.equal(fixture.streams.stream(0x6000n).byteLength, 5);
});

test("Flutter registry exposes measured fopen even with minimal state", () => {
	const heap = createNativeHeap(0x6000n, 0x200);
	const registry = createFlutterJniImportHandlers({
		javaVmAddress: 0x5000n,
		jniEnvironment: { environmentAddress: "21504" },
		nativeHeap: heap
	});
	assert.ok(registry.snapshot().includes("fopen"));
});

function createFixture(platformFiles = {}) {
	const memory = createNativeAnonymousMemory(0x5000n, 0x200, "fopen-strings");
	const heap = createNativeHeap(0x6000n, 0x400);
	const files = createNativeReadOnlyFiles({ platformFiles });
	const streams = createNativeReadOnlyFileStreams({ files, heap });
	const registry = createNativeHostImportRegistry();
	registerNativeLibcFileHandlers(registry, { nativeFileStreams: streams });
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(0, 0x5000n);
	registers.write(1, 0x5080n);
	registers.write(30, 0x7777n);
	return { memory, registers, registry, streams };
}

function invoke(fixture) {
	return fixture.registry.handle(
		{ name: "fopen" },
		{ memory: fixture.memory, registers: fixture.registers }
	);
}

function writeCString(memory, address, value) {
	memory.write(address, new TextEncoder().encode(`${value}\0`));
}
