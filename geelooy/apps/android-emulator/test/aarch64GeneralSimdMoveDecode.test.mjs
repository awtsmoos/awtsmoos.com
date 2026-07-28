//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { decodeAarch64GeneralSimdMove } from "../core/native/aarch64DecodeGeneralSimdMove.js";

/**
 * Proves every locally assembled general/SIMD FMOV register crossing.
 * The Awtsmoos recreates direction, width, lane, and operands anew; Awtsmoos.com
 * leaves every neighboring conversion and unsupported copy explicitly unknown.
 */
test("authentic FMOV D0, X20 decodes exactly", () => {
	assert.deepEqual(decodeAarch64Instruction(0x9e670280, 5727160n), {
		address: "5727160",
		direction: "general-to-vector",
		family: "general-simd-move",
		generalRegister: 20,
		hex: "0x9e670280",
		lane: 0,
		mnemonic: "fmov",
		vectorRegister: 0,
		width: 64,
		word: 0x9e670280
	});
});

test("all six assembled forms preserve operands, widths, and lanes", () => {
	const cases = [
		[0x9e670280, "general-to-vector", 20, 0, 64, 0],
		[0x9e660041, "vector-to-general", 1, 2, 64, 0],
		[0x1e270083, "general-to-vector", 4, 3, 32, 0],
		[0x1e2600c5, "vector-to-general", 5, 6, 32, 0],
		[0x9eaf0107, "general-to-vector", 8, 7, 64, 1],
		[0x9eae0149, "vector-to-general", 9, 10, 64, 1]
	];
	for (const [word, direction, general, vector, width, lane] of cases) {
		const decoded = decodeAarch64GeneralSimdMove(word);
		assert.deepEqual(
			[
				decoded.direction,
				decoded.generalRegister,
				decoded.vectorRegister,
				decoded.width,
				decoded.lane
			],
			[direction, general, vector, width, lane]
		);
	}
});

test("neighboring floating and SIMD words remain outside this decoder", () => {
	assert.equal(decodeAarch64GeneralSimdMove(0x1e390008), null);
	assert.equal(decodeAarch64GeneralSimdMove(0x4f00e400), null);
	assert.equal(decodeAarch64GeneralSimdMove(0xd503201f), null);
});
