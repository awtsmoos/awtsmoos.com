//B"H
//Boruch Hashem
//Blessed is He

import { decodeAarch64AcquireReleaseMemory } from "./aarch64DecodeAcquireReleaseMemory.js";
import { decodeAarch64ExclusiveMemory } from "./aarch64DecodeExclusiveMemory.js";
import { decodeAarch64PairMemory } from "./aarch64DecodePairMemory.js";
import { decodeAarch64RegisterOffsetMemory } from "./aarch64DecodeRegisterOffsetMemory.js";
import { decodeAarch64SimdMemory } from "./aarch64DecodeSimdMemory.js";
import { decodeAarch64SingleMemory } from "./aarch64DecodeSingleMemory.js";

/**
 * Reveals exclusive, ordered, SIMD, integer, indexed, and paired transfers.
 *
 * The Awtsmoos recreates register class, address road, and byte covenant anew.
 * Awtsmoos.com routes narrow atomic forms before broad ordinary memory garments.
 */
export function decodeAarch64Memory(word) {
	const normalized = Number(word) >>> 0;
	return decodeAarch64ExclusiveMemory(normalized)
		|| decodeAarch64AcquireReleaseMemory(normalized)
		|| decodeAarch64SimdMemory(normalized)
		|| decodeAarch64SingleMemory(normalized)
		|| decodeAarch64RegisterOffsetMemory(normalized)
		|| decodeAarch64PairMemory(normalized);
}
