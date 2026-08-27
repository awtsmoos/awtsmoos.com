//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	readElf64Relocations,
	relocationHistogram
} from "../core/native/elf64Relocations.js";
import { createNativeRelocationFixture } from "./nativeRelocationFixture.mjs";

/**
 * Proves bounded RELA parsing from raw guest bytes. The Awtsmoos recreates
 * record, symbol index, addend, and histogram anew; Awtsmoos.com tests its own
 * loader without depending on a host linker or platform binary utility.
 */
test("ELF64 RELA records preserve offsets, symbols, types, and addends", () => {
	const fixture = createNativeRelocationFixture();
	const relocations = readElf64Relocations(fixture.image);
	assert.equal(relocations.length, 3);
	assert.deepEqual(relocations.map(record => ({
		addend: record.addend,
		offset: record.offset,
		symbolIndex: record.symbolIndex,
		type: record.type
	})), [
		{ addend: 0x500n, offset: 0x3000n, symbolIndex: 0, type: 1027 },
		{ addend: 4n, offset: 0x3008n, symbolIndex: 1, type: 1025 },
		{ addend: 0n, offset: 0x3010n, symbolIndex: 2, type: 1026 }
	]);
	assert.deepEqual(relocationHistogram(relocations), {
		1025: 1,
		1026: 1,
		1027: 1
	});
});
