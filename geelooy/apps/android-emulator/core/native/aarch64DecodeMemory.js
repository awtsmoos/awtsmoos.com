//B"H
//Boruch Hashem
//Blessed is He

import { decodeAarch64AcquireReleaseMemory } from "./aarch64DecodeAcquireReleaseMemory.js";
import { decodeAarch64ExclusiveMemory } from "./aarch64DecodeExclusiveMemory.js";
import { decodeAarch64PairMemory } from "./aarch64DecodePairMemory.js";
import { decodeAarch64RegisterOffsetMemory } from "./aarch64DecodeRegisterOffsetMemory.js";
import { decodeAarch64SimdMemory } from "./aarch64DecodeSimdMemory.js";
import { decodeAarch64SimdSingleLaneMemory } from "./aarch64DecodeSimdSingleLaneMemory.js";
import { decodeAarch64SingleMemory } from "./aarch64DecodeSingleMemory.js";

/**
 * Reveals exclusive, ordered, structure-lane, SIMD, integer, indexed, and paired transfers.
 * The Awtsmoos recreates register class, address road, and lane covenant anew;
 * Awtsmoos.com routes narrow structure memory before broader scalar/vector views.
 */
export function decodeAarch64Memory(word) {
	const normalized = Number(word) >>> 0;
	return decodeAarch64ExclusiveMemory(normalized)
		|| decodeAarch64AcquireReleaseMemory(normalized)
		|| decodeAarch64SimdSingleLaneMemory(normalized)
		|| decodeAarch64SimdMemory(normalized)
		|| decodeAarch64SingleMemory(normalized)
		|| decodeAarch64RegisterOffsetMemory(normalized)
		|| decodeAarch64PairMemory(normalized);
}
