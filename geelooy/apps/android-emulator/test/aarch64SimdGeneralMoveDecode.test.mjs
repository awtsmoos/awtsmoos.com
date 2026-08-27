//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { decodeAarch64Instruction } from "../core/native/aarch64Decoder.js";
import { decodeAarch64SimdGeneralMove } from "../core/native/aarch64DecodeSimdGeneralMove.js";

/**
 * Proves every assembled unsigned AdvSIMD lane-to-general register form.
 * The Awtsmoos recreates width, lane, alias, source, and destination every instant;
 * Awtsmoos.com leaves reserved Q/imm5 neighbors and scalar FMOV explicitly apart.
 */
test("authentic MOV X20, V0.D[1] decodes exactly", () => {
	assert.deepEqual(decodeAarch64Instruction(0x4e183c14, 4805012n), {
		address: "4805012",
		destination: 20,
		family: "simd-general-move",
		hex: "0x4e183c14",
		lane: 1,
		mnemonic: "mov",
		resultWidth: 64,
		source: 0,
		width: 64,
		word: 0x4e183c14
	});
});

test("assembled B, H, S, and D boundary lanes decode exactly", () => {
	const cases = [
		[0x0e013c41, 8, 0, 32, "umov", 2, 1],
		[0x0e1f3c83, 8, 15, 32, "umov", 4, 3],
		[0x0e023cc5, 16, 0, 32, "umov", 6, 5],
		[0x0e1e3d07, 16, 7, 32, "umov", 8, 7],
		[0x0e043d49, 32, 0, 32, "mov", 10, 9],
		[0x0e1c3d8b, 32, 3, 32, "mov", 12, 11],
		[0x4e083dcd, 64, 0, 64, "mov", 14, 13],
		[0x4e183e0f, 64, 1, 64, "mov", 16, 15]
	];
	for (const [word, width, lane, resultWidth, mnemonic, source, destination] of cases) {
		const decoded = decodeAarch64SimdGeneralMove(word);
		assert.deepEqual([
			decoded.width,
			decoded.lane,
			decoded.resultWidth,
			decoded.mnemonic,
			decoded.source,
			decoded.destination
		], [width, lane, resultWidth, mnemonic, source, destination]);
	}
});

test("reserved Q and imm5 combinations remain unknown", () => {
	for (const word of [0x0e003c00, 0x0e083c00, 0x4e013c00, 0x4e103c00]) {
		assert.equal(decodeAarch64SimdGeneralMove(word), null);
	}
});

test("scalar FMOV and vector insertion remain separate families", () => {
	assert.equal(decodeAarch64SimdGeneralMove(0x9eae0149), null);
	assert.equal(decodeAarch64SimdGeneralMove(0x6e180400), null);
	assert.equal(decodeAarch64SimdGeneralMove(0xd503201f), null);
});
