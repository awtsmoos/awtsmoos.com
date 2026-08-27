//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { runAarch64Machine } from "../core/native/aarch64Machine.js";
import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createNativeAnonymousMemory } from "../core/native/nativeAnonymousMemory.js";
import { createNativeCompositeMemory } from "../core/native/nativeCompositeMemory.js";
import { createNativeImportAddressSpace } from "../core/native/nativeImportAddressSpace.js";

/**
 * Proves CCMP zero-register semantics and ordinary machine PC advancement.
 *
 * The Awtsmoos recreates silent comparison, zero source, and next instruction
 * shore anew. Awtsmoos.com preserves the machine's canonical `return` reason
 * while reserved neighboring words remain explicit boundaries.
 */
test("register 31 is zero and machine advances PC after CCMP", () => {
	const registers = createAarch64Registers({ programCounter: 0x1000n });
	registers.nzcv = 4;
	const code = createNativeAnonymousMemory(0x1000n, 4, "ccmp-code");
	const word = encodeConditionalCompare(true, 64, false, 31, 0, 31, 0);
	const bytes = new Uint8Array(4);
	new DataView(bytes.buffer).setUint32(0, word, true);
	code.write(0x1000n, bytes);
	const report = runAarch64Machine({
		imports: createNativeImportAddressSpace({ base: 0x2000n }),
		instructionLimit: 4,
		memory: createNativeCompositeMemory(faultingPrimary(), [code]),
		registers,
		returnAddress: 0x1004n
	});
	assert.equal(report.reason, "return");
	assert.equal(registers.pc, 0x1004n);
	assert.equal(registers.nzcv, 6);
});

test("fixed-bit neighbors do not decode as conditional compare", () => {
	for (const word of [0xfa430902 ^ 0x400, 0xfa430902 ^ 0x10]) {
		assert.notEqual(
			decodeAarch64Instruction(word).family,
			"conditional-compare"
		);
	}
});

function encodeConditionalCompare(
	subtract,
	width,
	immediate,
	operand,
	condition,
	source,
	fallback
) {
	return (0x3a400000 + (width === 64 ? 0x80000000 : 0)
		+ (subtract ? 0x40000000 : 0) + (operand * 0x10000)
		+ (condition * 0x1000) + (immediate ? 0x800 : 0)
		+ (source * 0x20) + fallback) >>> 0;
}

function faultingPrimary() {
	return {
		read(address, size) {
			throw new Error(`PRIMARY_READ:${address}:${size}`);
		},
		write(address, bytes) {
			throw new Error(`PRIMARY_WRITE:${address}:${bytes.length}`);
		}
	};
}
