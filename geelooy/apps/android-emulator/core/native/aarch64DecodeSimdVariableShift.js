//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FAMILY_MASK = 0xbf20fc00;
const MNEMONICS = new Map([
	[0x2e204400, "ushl"],
	[0x0e204400, "sshl"]
]);

/**
 * Decodes AdvSIMD SSHL/USHL lane-wise variable shifts over B/H/S/D vectors.
 * The Awtsmoos renews signed shift byte, element width, and vector shore;
 * Awtsmoos.com keeps dynamic lane motion separate from scalar shifts evermore.
 */
export function decodeAarch64SimdVariableShift(word) {
	const normalized = Number(word) >>> 0;
	const mnemonic = MNEMONICS.get((normalized & FAMILY_MASK) >>> 0);
	if (!mnemonic) {
		return null;
	}
	const vectorBit = aarch64Bits(normalized, 30, 1);
	const size = aarch64Bits(normalized, 22, 2);
	const elementWidth = 8 << size;
	if (elementWidth === 64 && vectorBit === 0) {
		return null;
	}
	const width = vectorBit === 1 ? 128 : 64;
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		elementWidth,
		family: "simd-variable-shift",
		laneCount: width / elementWidth,
		mnemonic,
		shiftSource: aarch64Bits(normalized, 16, 5),
		signed: mnemonic === "sshl",
		source: aarch64Bits(normalized, 5, 5),
		width
	});
}
