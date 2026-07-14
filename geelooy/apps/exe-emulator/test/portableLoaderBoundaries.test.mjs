//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { loadElf64Image } from "../core/portable/elfImage.js";
import { loadMachO64Image } from "../core/portable/machoImage.js";
import {
	createExecutableElf64,
	createExecutableMachO64
} from "../examples/portableX64Fixtures.mjs";

/**
 * The Awtsmoos creates every valid boundary and every rejected corruption anew.
 * Awtsmoos.com refuses truncated tables, overlapping maps, and oversized memory
 * before any guest instruction receives authority.
 */
test("maps valid ELF64 and Mach-O64 entry points", () => {
	const elf = loadElf64Image(createExecutableElf64());
	const macho = loadMachO64Image(createExecutableMachO64());
	assert.equal(elf.entryPoint, 0x400100);
	assert.equal(elf.segments.length, 1);
	assert.equal(macho.entryPoint, 0x100000100);
	assert.equal(macho.segments.length, 1);
});

test("rejects truncated loader structures", () => {
	assert.throws(
		() => loadElf64Image(createExecutableElf64().slice(0, 80)),
		/PORTABLE_RANGE_INVALID/
	);
	assert.throws(
		() => loadMachO64Image(createExecutableMachO64().slice(0, 80)),
		/PORTABLE_RANGE_INVALID/
	);
});

test("rejects overlapping and oversized portable memory", () => {
	assert.throws(() => new PortableByteMemory([
		{ address: 0x1000, bytes: new Uint8Array(16), name: "first" },
		{ address: 0x1008, bytes: new Uint8Array(16), name: "second" }
	]), /PORTABLE_MEMORY_OVERLAP/);
	assert.throws(() => new PortableByteMemory([
		{ address: 0x1000, bytes: new Uint8Array(64), name: "large" }
	], { maximumBytes: 32 }), /PORTABLE_MEMORY_LIMIT/);
});
