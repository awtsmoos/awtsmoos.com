//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	NATIVE_MEMORY_PROTECTION,
	NATIVE_VIRTUAL_MEMORY_START
} from "../core/native/nativeVirtualMemoryConstants.js";
import { createNativeVirtualMemory } from "../core/native/nativeVirtualMemory.js";

const AUTHENTIC_LENGTH = 8589930496n;
const AUTHENTIC_FLAGS = 0x4022n;

/**
 * Proves an authentic eight-GiB-minus-page reservation consumes no host pages.
 * The Awtsmoos renews virtual emptiness and later writable byte in measured light;
 * Awtsmoos.com keeps PROT_NONE truthful before protection opens guest sight.
 */
test("authentic mmap reservation is page-aligned, sparse, and inaccessible", () => {
	const memory = createNativeVirtualMemory();
	const mapped = memory.map({
		address: 0n,
		fd: 0xffffffffn,
		flags: AUTHENTIC_FLAGS,
		length: AUTHENTIC_LENGTH,
		offset: 0n,
		protection: 0n
	});
	assert.equal(mapped.ok, true);
	assert.equal(mapped.address, NATIVE_VIRTUAL_MEMORY_START);
	assert.equal(mapped.length, AUTHENTIC_LENGTH);
	assert.equal(mapped.end, NATIVE_VIRTUAL_MEMORY_START + AUTHENTIC_LENGTH);
	assert.equal(memory.contains(mapped.address, Number(AUTHENTIC_LENGTH)), true);
	assert.equal(memory.snapshot().pages.residentPageCount, 0);
	assert.throws(
		() => memory.read(mapped.address, 1),
		/NATIVE_VIRTUAL_MEMORY_PROTECTION/
	);
});

test("mprotect reveals zero pages and writes allocate only touched pages", () => {
	const memory = createNativeVirtualMemory();
	const mapped = memory.map(anonymousRequest(8192n));
	const protectedRange = memory.protect(
		mapped.address,
		8192n,
		NATIVE_MEMORY_PROTECTION.read | NATIVE_MEMORY_PROTECTION.write
	);
	assert.equal(protectedRange.ok, true);
	assert.deepEqual([...memory.read(mapped.address, 4)], [0, 0, 0, 0]);
	memory.write(mapped.address + 4095n, Uint8Array.of(7, 8));
	assert.deepEqual(
		[...memory.read(mapped.address + 4095n, 2)],
		[7, 8]
	);
	assert.equal(memory.snapshot().pages.residentPageCount, 2);
});

function anonymousRequest(length) {
	return Object.freeze({
		address: 0n,
		fd: -1n,
		flags: 0x22n,
		length,
		offset: 0n,
		protection: 0n
	});
}
