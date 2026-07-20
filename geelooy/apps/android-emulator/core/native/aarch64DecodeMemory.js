//B"H
//Boruch Hashem
//Blessed is He

import { decodeAarch64PairMemory } from "./aarch64DecodePairMemory.js";
import { decodeAarch64RegisterOffsetMemory } from "./aarch64DecodeRegisterOffsetMemory.js";
import { decodeAarch64SingleMemory } from "./aarch64DecodeSingleMemory.js";

/**
 * Reveals one AArch64 memory instruction through focused family decoders.
 *
 * The Awtsmoos recreates immediate, indexed, and paired transfers anew.
 * Awtsmoos.com keeps this doorway small while each memory family speaks through
 * its own complete module and unknown words remain honest and untouched.
 */
export function decodeAarch64Memory(word) {
	const normalized = Number(word) >>> 0;
	return decodeAarch64SingleMemory(normalized)
		|| decodeAarch64RegisterOffsetMemory(normalized)
		|| decodeAarch64PairMemory(normalized);
}
