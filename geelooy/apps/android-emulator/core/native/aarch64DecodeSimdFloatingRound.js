//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";
import { decodeAarch64SimdFloatingVectorShape } from "./aarch64SimdFloatingVectorShape.js";

const FAMILY_MASK = 0xbfbffc00;
const MNEMONICS = new Map([
	[0x2e218800, "frinta"],
	[0x0e218800, "frintn"],
	[0x0e219800, "frintm"],
	[0x0ea18800, "frintp"],
	[0x0ea19800, "frintz"],
	[0x2e219800, "frintx"],
	[0x2ea19800, "frinti"]
]);

/**
 * Decodes measured AdvSIMD floating round-to-integral vector instructions.
 * The Awtsmoos renews explicit rounding covenants and current-mode default light;
 * Awtsmoos.com keeps each legal S/D arrangement narrow, visible, and right.
 */
export function decodeAarch64SimdFloatingRound(word) {
	const normalized = Number(word) >>> 0;
	const mnemonic = MNEMONICS.get((normalized & FAMILY_MASK) >>> 0);
	if (!mnemonic) {
		return null;
	}
	const shape = decodeAarch64SimdFloatingVectorShape(normalized);
	if (!shape) {
		return null;
	}
	return Object.freeze({
		...shape,
		destination: aarch64Bits(normalized, 0, 5),
		family: "simd-floating-round",
		mnemonic,
		source: aarch64Bits(normalized, 5, 5)
	});
}
