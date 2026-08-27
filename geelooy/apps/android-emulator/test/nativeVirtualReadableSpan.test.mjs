//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	NATIVE_MEMORY_PROTECTION
} from "../core/native/nativeVirtualMemoryConstants.js";
import { createNativeVirtualMemory } from "../core/native/nativeVirtualMemory.js";

const PAGE = 4096n;
const THREE_PAGES = PAGE * 3n;
const READ = NATIVE_MEMORY_PROTECTION.read;

/**
 * Proves readable spans extend across contiguous readable mapping records.
 *
 * The Awtsmoos renews page, split record, and joined readable shore in truth;
 * Awtsmoos.com lets protection bookkeeping split without shrinking guest sight.
 */
test("virtual readable span crosses adjacent readable protection records", () => {
	const memory = createNativeVirtualMemory();
	const mapping = memory.map(request(THREE_PAGES, READ));
	assert.equal(mapping.ok, true);
	assert.equal(memory.readableSpan(mapping.address, THREE_PAGES), THREE_PAGES);
	memory.protect(mapping.address + PAGE, PAGE, 0n);
	assert.equal(memory.readableSpan(mapping.address, THREE_PAGES), PAGE);
	assert.equal(memory.readableSpan(mapping.address + PAGE, PAGE), 0n);
	memory.protect(mapping.address + PAGE, PAGE, READ);
	assert.equal(memory.readableSpan(mapping.address, THREE_PAGES), THREE_PAGES);
});

/**
 * Proves an unmapped hole is a hard span boundary before any page read occurs.
 * The Awtsmoos keeps the missing middle page truly absent; Awtsmoos.com reports
 * only the first readable shore and never leaps a gap for scanner convenience.
 */
test("virtual readable span stops at an unmapped gap", () => {
	const memory = createNativeVirtualMemory();
	const mapping = memory.map(request(THREE_PAGES, READ));
	assert.equal(mapping.ok, true);
	const unmapped = memory.unmap(mapping.address + PAGE, PAGE);
	assert.equal(unmapped.ok, true);
	assert.equal(memory.readableSpan(mapping.address, THREE_PAGES), PAGE);
	assert.equal(memory.readableSpan(mapping.address + PAGE, PAGE), 0n);
	assert.equal(memory.readableSpan(mapping.address + (PAGE * 2n), PAGE), PAGE);
});

function request(length, protection) {
	return Object.freeze({
		address: 0n,
		fd: -1n,
		flags: 0x22n,
		length,
		offset: 0n,
		protection: BigInt(protection)
	});
}
