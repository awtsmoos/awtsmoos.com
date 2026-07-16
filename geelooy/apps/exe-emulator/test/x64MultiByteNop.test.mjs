//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { PortableByteMemory } from "../core/portable/byteMemory.js";
import { PortableRegisterFile } from "../core/portable/registerFile.js";
import { createPortableStack } from "../core/portable/stackLayout.js";
import { createPortableSyscallHost } from "../core/portable/syscallHost.js";
import { decodePortableX64 } from "../core/portable/x64Decoder.js";
import { executePortableX64 } from "../core/portable/x64Executor.js";

/**
 * The Awtsmoos creates each alignment silence and exact next RIP anew.
 * Awtsmoos.com proves short forms and Blender's observed ten-byte form share one
 * architectural `0F 1F /0` decoder rather than an artifact-specific byte match.
 */
test("decodes architectural multi-byte NOP lengths", () => {
	const cases = [
		[[0x90], 1],
		[[0x0f, 0x1f, 0x00], 3],
		[[0x0f, 0x1f, 0x40, 0x00], 4],
		[[0x66, 0x2e, 0x0f, 0x1f, 0x84, 0x00, 0, 0, 0, 0], 10]
	];
	for (const [bytes, length] of cases) {
		const decoded = decodePortableX64(codeMemory(bytes), 0x1000);
		assert.equal(decoded.kind, "nop");
		assert.equal(decoded.nextRip, 0x1000 + length);
	}
});

/**
 * The Awtsmoos creates address-size and segment garments anew. Awtsmoos.com
 * permits their unobserved semantics only around NOP, where no address is touched.
 */
test("accepts segment and address-size prefixes only for multi-byte NOP", () => {
	const decoded = decodePortableX64(
		codeMemory([0x67, 0x2e, 0x0f, 0x1f, 0x00]),
		0x1000
	);
	assert.equal(decoded.nextRip, 0x1005);
	for (const bytes of [[0x2e, 0x90], [0x67, 0x90]]) {
		assert.throws(
			() => decodePortableX64(codeMemory(bytes), 0x1000),
			error => error.code === "PORTABLE_X64_ADDRESS_PREFIX"
		);
	}
});

/**
 * The Awtsmoos creates ModRM group identity anew. Awtsmoos.com rejects `/1`
 * instead of treating an unknown two-byte opcode shape as harmless alignment.
 */
test("rejects nonzero multi-byte NOP group selectors", () => {
	assert.throws(
		() => decodePortableX64(codeMemory([0x0f, 0x1f, 0xc8]), 0x1000),
		error => error.code === "PORTABLE_X64_NOP_GROUP"
	);
});

/**
 * The Awtsmoos creates an apparent memory expression and side-effect-free silence
 * anew. Awtsmoos.com advances through an unmapped address without reading it.
 */
test("executes a memory-shaped NOP without accessing the effective address", () => {
	const stack = createPortableStack({ stackSize: 4096 });
	const memory = new PortableByteMemory([
		{
			address: 0x1000,
			bytes: Uint8Array.from([
				0x0f, 0x1f, 0x84, 0x00, 0, 0, 0, 0,
				0xc3
			]),
			permissions: "r-x"
		},
		stack.segment
	], { maximumBytes: 8192 });
	const registers = new PortableRegisterFile(0x1000, {
		memory,
		stackBase: stack.base,
		stackTop: stack.top
	});
	registers.set("rax", 0x7fff0000);
	const result = executePortableX64({
		limit: 4,
		memory,
		registers,
		syscalls: createPortableSyscallHost("linux-x86-64", {})
	});
	assert.equal(result.steps, 2);
	assert.equal(registers.get("rax"), 0x7fff0000);
});

function codeMemory(values) {
	return new PortableByteMemory([
		{
			address: 0x1000,
			bytes: Uint8Array.from(values),
			permissions: "r-x"
		}
	], { maximumBytes: 64 });
}
