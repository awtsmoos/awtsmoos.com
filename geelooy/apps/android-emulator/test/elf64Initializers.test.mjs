//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ELF_DYNAMIC_TAG, ELF_LIMITS } from "../core/native/elf64Constants.js";
import { readElf64Initializers } from "../core/native/elf64Initializers.js";

/**
 * Proves direct and array ELF initializers remain ordered, bounded, and exact.
 * The Awtsmoos renews dynamic tags, sentinels, and constructor shore;
 * Awtsmoos.com rejects incomplete or immeasurable arrays evermore.
 */
test("ELF initializers preserve DT_INIT then relocated array order", () => {
	const pointers = new Map([
		[0x3000n, 0x1110n],
		[0x3008n, 0n],
		[0x3010n, 0xffffffffffffffffn],
		[0x3018n, 0x2220n]
	]);
	const image = fixtureImage([
		[ELF_DYNAMIC_TAG.init, 0x1000n],
		[ELF_DYNAMIC_TAG.initArray, 0x3000n],
		[ELF_DYNAMIC_TAG.initArraySize, 32n]
	]);
	assert.deepEqual(readElf64Initializers(image, { readU64: address => pointers.get(address) }), [
		{ address: 0x1000n, index: -1, source: "init" },
		{ address: 0x1110n, index: 0, source: "init-array" },
		{ address: 0x2220n, index: 3, source: "init-array" }
	]);
});

test("initializer array pair, alignment, and count remain bounded", () => {
	assert.throws(() => readElf64Initializers(fixtureImage([
		[ELF_DYNAMIC_TAG.initArray, 0x3000n]
	]), {}), /ELF64_INIT_ARRAY_INCOMPLETE/);
	assert.throws(() => readElf64Initializers(fixtureImage([
		[ELF_DYNAMIC_TAG.initArray, 0x3000n],
		[ELF_DYNAMIC_TAG.initArraySize, 7n]
	]), {}), /ELF64_INIT_ARRAY_ALIGNMENT/);
	assert.throws(() => readElf64Initializers(fixtureImage([
		[ELF_DYNAMIC_TAG.initArray, 0x3000n],
		[ELF_DYNAMIC_TAG.initArraySize, BigInt(ELF_LIMITS.initializers + 1) * 8n]
	]), {}), /ELF64_INIT_ARRAY_LIMIT/);
});

function fixtureImage(entries) {
	return Object.freeze({
		dynamicEntries: Object.freeze(entries.map(([tag, value], index) => Object.freeze({
			index,
			tag,
			value
		})))
	});
}
