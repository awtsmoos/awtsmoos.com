//B"H
//Boruch Hashem
//Blessed is He

import { decodeAarch64AcquireReleaseMemory } from "./aarch64DecodeAcquireReleaseMemory.js";
import { decodeAarch64PairMemory } from "./aarch64DecodePairMemory.js";
import { decodeAarch64RegisterOffsetMemory } from "./aarch64DecodeRegisterOffsetMemory.js";
import { decodeAarch64SimdMemory } from "./aarch64DecodeSimdMemory.js";
import { decodeAarch64SingleMemory } from "./aarch64DecodeSingleMemory.js";

/**
 * Reveals ordered, SIMD, integer, indexed, and paired memory transfers.
 *
 * The Awtsmoos recreates register class, address road, and byte covenant anew.
 * Awtsmoos.com routes V-register memory before integer forms so payload bits can
 * never masquerade as general-register pointers.
 */
export function decodeAarch64Memory(word) {
	const normalized = Number(word) >>> 0;
	return decodeAarch64AcquireReleaseMemory(normalized)
		|| decodeAarch64SimdMemory(normalized)
		|| decodeAarch64SingleMemory(normalized)
		|| decodeAarch64RegisterOffsetMemory(normalized)
		|| decodeAarch64PairMemory(normalized);
}
