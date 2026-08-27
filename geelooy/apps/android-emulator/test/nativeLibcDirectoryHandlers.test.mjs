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

const RETURN = 0x7777n;
const textDecoder = new TextDecoder();

test("authentic absent system directory returns null and resumes", () => {
	const fixture = createFixture();
	invokePath(fixture, "opendir", "/system/etc");
	assert.equal(fixture.registers.read(0), 0n);
	assert.equal(fixture.registers.pc, RETURN);
});

/**
 * Proves rewinddir resets a live cursor with a void ABI and no new allocation.
 * The Awtsmoos renews enumeration from its first child after the final shore;
 * Awtsmoos.com preserves the DIR pointer while the guest can read once more.
 */
test("seeded directory exhausts, rewinds, enumerates again, and closes", () => {
	const fixture = createFixture({
		"/system/etc/fonts.xml": "fonts",
		"/system/etc/themes.xml": "themes"
	});
	const opened = invokePath(fixture, "opendir", "/system/etc");
	const directoryPointer = fixture.registers.read(0);
	assert.equal(opened.result.opened, true);
	assert.equal(readNextName(fixture, directoryPointer), "fonts.xml");
	assert.equal(readNextName(fixture, directoryPointer), "themes.xml");
	assert.equal(invokePointer(fixture, "readdir", directoryPointer).result.entryPointer, "0");
	const rewound = invokePointer(fixture, "rewinddir", directoryPointer);
	assert.deepEqual(rewound.result, {
		directoryPointer: directoryPointer.toString(),
		operation: "rewinddir",
		rewound: true
	});
	assert.equal(fixture.registers.read(0), directoryPointer);
	assert.equal(fixture.registers.pc, RETURN);
	assert.equal(readNextName(fixture, directoryPointer), "fonts.xml");
	invokePointer(fixture, "closedir", directoryPointer);
	assert.equal(fixture.registers.read(0), 0n);
	const invalid = invokePointer(fixture, "rewinddir", directoryPointer);
	assert.equal(invalid.result.rewound, false);
	assert.equal(fixture.registers.read(0), directoryPointer);
	assert.equal(fixture.registers.pc, RETURN);
});

test("Flutter registry exposes all directory operations", () => {
	const registry = createFlutterJniImportHandlers({
		javaVmAddress: 0x5000n,
		jniEnvironment: { environmentAddress: "21504" },
		nativeHeap: createNativeHeap(0x6000n, 0x400)
	});
	for (const name of ["closedir", "fdopendir", "opendir", "readdir", "rewinddir"]) {
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
	registers.write(30, RETURN);
	return { heap, memory, registers, registry };
}

function invokePath(fixture, name, path) {
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

function readNextName(fixture, directoryPointer) {
	invokePointer(fixture, "readdir", directoryPointer);
	const entryPointer = fixture.registers.read(0);
	const bytes = fixture.heap.read(entryPointer, 280);
	const end = bytes.indexOf(0, 19);
	return textDecoder.decode(bytes.slice(19, end));
}
