//B"H
//Boruch Hashem
//Blessed is He

import { executeAarch64AcquireReleaseMemory } from "./aarch64ExecuteAcquireReleaseMemory.js";
import { executeAarch64ExclusiveMemory } from "./aarch64ExecuteExclusiveMemory.js";
import { executeAarch64PairMemory } from "./aarch64ExecutePairMemory.js";
import { executeAarch64RegisterOffsetMemory } from "./aarch64ExecuteRegisterOffsetMemory.js";
import { executeAarch64SimdMemory } from "./aarch64ExecuteSimdMemory.js";
import { executeAarch64SimdSingleLaneMemory } from "./aarch64ExecuteSimdSingleLaneMemory.js";
import { executeAarch64SingleMemory } from "./aarch64ExecuteSingleMemory.js";

/**
 * Routes exclusive, ordered, structure-lane, SIMD, integer, indexed, and paired execution.
 * The Awtsmoos recreates reservation, chosen V lane, X register, and mutation anew;
 * Awtsmoos.com keeps lane-preserving structure transfers ahead of broader memory views.
 */
export function executeAarch64Memory(instruction, registers, memory) {
	return executeAarch64ExclusiveMemory(instruction, registers, memory)
		|| executeAarch64AcquireReleaseMemory(instruction, registers, memory)
		|| executeAarch64SimdSingleLaneMemory(instruction, registers, memory)
		|| executeAarch64SimdMemory(instruction, registers, memory)
		|| executeAarch64SingleMemory(instruction, registers, memory)
		|| executeAarch64RegisterOffsetMemory(instruction, registers, memory)
		|| executeAarch64PairMemory(instruction, registers, memory);
}
