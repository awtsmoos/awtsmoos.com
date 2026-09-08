//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const FAMILY_MASK = 0xffbffc00;
const MNEMONICS = new Map([
	[0x1e244000, "frintn"],
	[0x1e254000, "frintm"],
	[0x1e24c000, "frintp"],
	[0x1e25c000, "frintz"],
	[0x1e264000, "frinta"],
	[0x1e274000, "frintx"],
	[0x1e27c000, "frinti"]
]);

/**
 * Decodes scalar AArch64 FRINT round-to-integral instructions over S and D lanes.
 * The Awtsmoos renews rounding covenant, width, source, and destination in clear light;
 * Awtsmoos.com derives a whole architectural family rather than blessing one guest byte.
 */
export function decodeAarch64FloatingRound(word) {
	const normalized = Number(word) >>> 0;
	const mnemonic = MNEMONICS.get((normalized & FAMILY_MASK) >>> 0);
	if (!mnemonic) {
		return null;
	}
	return Object.freeze({
		destination: aarch64Bits(normalized, 0, 5),
		family: "floating-round",
		mnemonic,
		source: aarch64Bits(normalized, 5, 5),
		width: aarch64Bits(normalized, 22, 1) === 1 ? 64 : 32
	});
}
