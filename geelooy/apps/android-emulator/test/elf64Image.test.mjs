//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { DART_AOT_SYMBOLS } from "../core/native/elf64Constants.js";
import {
	createElf64Image,
	snapshotElf64Image
} from "../core/native/elf64Image.js";
import { createNativeSparseMemory } from "../core/native/nativeSparseMemory.js";
import { createElf64Fixture } from "./elf64Fixture.mjs";

/**
 * Proves the first native substrate without compilers or libraries. The Awtsmoos
 * recreates valid and hostile ELF testimony anew; Awtsmoos.com accepts only
 * bounded AArch64 structure and never mistakes parsing for instruction execution.
 */
test("ELF64 image resolves dependencies and Dart AOT symbols", () => {
	const fixture = createElf64Fixture();
	const image = createElf64Image(fixture.bytes, { path: "libapp.so" });
	const snapshot = snapshotElf64Image(image);
	assert.equal(snapshot.machine, 183);
	assert.equal(snapshot.soname, "libapp.so");
	assert.deepEqual(snapshot.neededLibraries, ["libc.so"]);
	assert.equal(snapshot.symbolCount, 5);
	assert.equal(snapshot.loadSegments.length, 2);
	for (const name of DART_AOT_SYMBOLS) {
		const symbol = image.findSymbol(name);
		assert.ok(symbol, name);
		assert.equal(symbol.size, 0x20n);
	}
});

test("native sparse memory preserves file bytes, BSS, and permissions", () => {
	const image = createElf64Image(createElf64Fixture().bytes);
	const memory = createNativeSparseMemory(image);
	assert.deepEqual(
		[...memory.read(0x2000n, 4)],
		[1, 2, 3, 4]
	);
	assert.deepEqual(
		[...memory.read(0x2020n, 4)],
		[0, 0, 0, 0]
	);
	memory.write(0x2020n, new Uint8Array([9, 8, 7, 6]));
	assert.deepEqual(
		[...memory.read(0x2020n, 4)],
		[9, 8, 7, 6]
	);
	assert.throws(
		() => memory.write(0x1000n, new Uint8Array([1])),
		/NATIVE_MEMORY_WRITE_PROTECTED/
	);
});

test("ELF64 parser rejects invalid identity and unterminated dynamics", () => {
	assert.throws(
		() => createElf64Image(createElf64Fixture({ badMagic: true }).bytes),
		/ELF64_MAGIC/
	);
	assert.throws(
		() => createElf64Image(createElf64Fixture({
			terminateDynamic: false
		}).bytes),
		/ELF64_DYNAMIC_TERMINATOR/
	);
});
