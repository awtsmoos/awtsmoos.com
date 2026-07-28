//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createFlutterJniImportHandlers } from "../core/native/flutterJniImportHandlers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeDirectoryStreams } from "../core/native/nativeDirectoryStreams.js";
import { createNativeHeap } from "../core/native/nativeHeap.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativeLibcFileHandlers } from "../core/native/nativeLibcFileHandlers.js";
import { createNativeReadOnlyDirectories } from "../core/native/nativeReadOnlyDirectories.js";

const textDecoder = new TextDecoder();

test("authentic absent system directory returns null and resumes", () => {
	const fixture = createFixture();
	invoke(fixture, "opendir", "/system/etc");
	assert.equal(fixture.registers.read(0), 0n);
	assert.equal(fixture.registers.pc, 0x7777n);
});

test("seeded directory enumerates one child and closes", () => {
	const fixture = createFixture({ "/system/etc/fonts.xml": "fonts" });
	const opened = invoke(fixture, "opendir", "/system/etc");
	const directoryPointer = fixture.registers.read(0);
	assert.equal(opened.result.opened, true);
	invokePointer(fixture, "readdir", directoryPointer);
	const entryPointer = fixture.registers.read(0);
	const bytes = fixture.heap.read(entryPointer, 280);
	const end = bytes.indexOf(0, 19);
	assert.equal(textDecoder.decode(bytes.slice(19, end)), "fonts.xml");
	assert.equal(bytes[18], 8);
	invokePointer(fixture, "readdir", directoryPointer);
	assert.equal(fixture.registers.read(0), 0n);
	invokePointer(fixture, "closedir", directoryPointer);
	assert.equal(fixture.registers.read(0), 0n);
});

test("Flutter registry exposes the complete directory trio", () => {
	const registry = createFlutterJniImportHandlers({
		javaVmAddress: 0x5000n,
		jniEnvironment: { environmentAddress: "21504" },
		nativeHeap: createNativeHeap(0x6000n, 0x400)
	});
	for (const name of ["closedir", "opendir", "readdir"]) {
		assert.ok(registry.snapshot().includes(name));
	}
});

function createFixture(platformFiles = {}) {
	const memory = createNativeAnonymousMemory(0x5000n, 0x200, "directory-strings");
	const heap = createNativeHeap(0x6000n, 0x1000);
	const directories = createNativeReadOnlyDirectories({ platformFiles });
	const streams = createNativeDirectoryStreams({ directories, heap });
	const registry = createNativeHostImportRegistry();
	registerNativeLibcFileHandlers(registry, { nativeDirectoryStreams: streams });
	const registers = createAarch64Registers({ programCounter: 0x9000n });
	registers.write(30, 0x7777n);
	return { heap, memory, registers, registry };
}

function invoke(fixture, name, path) {
	fixture.memory.write(0x5000n, new TextEncoder().encode(`${path}\0`));
	return invokePointer(fixture, name, 0x5000n);
}

function invokePointer(fixture, name, pointer) {
	fixture.registers.write(0, pointer);
	fixture.registers.pc = 0x9000n;
	return fixture.registry.handle(
		{ name },
		{ memory: fixture.memory, registers: fixture.registers }
	);
}
