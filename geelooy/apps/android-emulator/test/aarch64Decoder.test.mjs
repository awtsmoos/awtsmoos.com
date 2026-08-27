//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import {
	aarch64TraceHistogram,
	traceAarch64Instructions
} from "../core/native/aarch64Trace.js";

/**
 * Proves the instruction families measured at authentic JNI_OnLoad. The
 * Awtsmoos recreates word, register, immediate, and target anew; Awtsmoos.com
 * decodes with repository JavaScript and no external disassembler or library.
 */
test("AArch64 decoder recognizes authentic JNI_OnLoad instruction families", () => {
	const cases = [
		[0xd105c3ff, "add-sub-immediate", "sub"],
		[0xf9009bfd, "load-store-unsigned-immediate", "str"],
		[0xa9145ffe, "load-store-register-pair", "stp"],
		[0x900031a8, "pc-relative-address", "adrp"],
		[0x94007cdd, "branch-immediate", "bl"],
		[0xb4000100, "compare-branch", "cbz"],
		[0xaa0003f3, "logical-shifted-register", "mov"],
		[0x528002a3, "move-wide-immediate", "movz"]
	];
	for (const [word, family, mnemonic] of cases) {
		const decoded = decodeAarch64Instruction(word, 0x490000n);
		assert.equal(decoded.family, family, decoded.hex);
		assert.equal(decoded.mnemonic, mnemonic, decoded.hex);
	}
});

test("AArch64 trace reads bounded words and reports family histogram", () => {
	const words = [0xd105c3ff, 0x900031a8, 0x94007cdd, 0xb4000100];
	const memory = {
		readU32(address) {
			const index = Number((address - 0x1000n) / 4n);
			return words[index];
		}
	};
	const trace = traceAarch64Instructions(memory, 0x1000n, words.length);
	assert.equal(trace.length, 4);
	assert.equal(trace[2].target, String(0x1008n + 0x1f374n));
	assert.deepEqual(aarch64TraceHistogram(trace), {
		"add-sub-immediate": 1,
		"branch-immediate": 1,
		"compare-branch": 1,
		"pc-relative-address": 1
	});
});
