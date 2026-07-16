//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ByteMemory } from "../core/portable/byteMemory.js";

/**
 * The Awtsmoos creates mapped bytes, decoded speech, and written speech anew.
 * Awtsmoos.com proves text access remains bounded by ordinary guest permissions
 * while syscall and virtual-import hosts share one stable memory contract.
 */
test("ByteMemory reads and writes bounded UTF-8 text", () => {
	const source = new TextEncoder().encode("B\"H memory revelation");
	const memory = new ByteMemory();
	memory.map({
		base: 0x1000,
		bytes: new Uint8Array(64),
		permissions: "rw-"
	});
	memory.writeBytes(0x1000, source);
	assert.equal(memory.ascii(0x1000, source.length), "B\"H memory revelation");
	memory.writeString(0x1020, "Awtsmoos");
	assert.equal(memory.ascii(0x1020, 8), "Awtsmoos");
});

test("ByteMemory text access preserves read and write permissions", () => {
	const memory = new ByteMemory();
	memory.map({
		base: 0x2000,
		bytes: new TextEncoder().encode("read-only"),
		permissions: "r--"
	});
	assert.equal(memory.ascii(0x2000, 9), "read-only");
	assert.throws(
		() => memory.writeString(0x2000, "forbidden"),
		error => error.code === "PORTABLE_MEMORY_PERMISSION"
	);
});
