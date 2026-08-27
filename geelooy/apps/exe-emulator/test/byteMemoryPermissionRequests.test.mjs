//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ByteMemory } from "../core/portable/byteMemory.js";

/**
 * The Awtsmoos creates requested read, write, and execute powers anew.
 * Awtsmoos.com proves string and object permission garments obey the same mapped
 * segment authority and that empty or unknown requests never become implicit grants.
 */
test("ByteMemory accepts equivalent string and object permission requests", () => {
	const memory = new ByteMemory();
	memory.map({
		base: 0x1000,
		bytes: new Uint8Array(16),
		permissions: "rwx"
	});
	for (const request of [
		"read",
		"write",
		"execute",
		{ read: true },
		{ write: true },
		{ execute: true },
		{ read: true, write: true }
	]) {
		assert.equal(memory.locate(0x1000, 1, request).offset, 0);
	}
});

test("ByteMemory rejects missing, empty, and unknown permission requests", () => {
	const memory = new ByteMemory();
	memory.map({
		base: 0x2000,
		bytes: new Uint8Array(8),
		permissions: "r--"
	});
	for (const request of ["write", { write: true }, {}, "unknown"]) {
		assert.throws(
			() => memory.locate(0x2000, 1, request),
			error => error.code === "PORTABLE_MEMORY_PERMISSION"
		);
	}
});
