//B"H
//Boruch Hashem
//Blessed is He

import { executeAarch64AcquireReleaseMemory } from "./aarch64ExecuteAcquireReleaseMemory.js";
import { executeAarch64PairMemory } from "./aarch64ExecutePairMemory.js";
import { executeAarch64RegisterOffsetMemory } from "./aarch64ExecuteRegisterOffsetMemory.js";
import { executeAarch64SimdMemory } from "./aarch64ExecuteSimdMemory.js";
import { executeAarch64SingleMemory } from "./aarch64ExecuteSingleMemory.js";

/**
 * Routes ordered, SIMD, integer, indexed, and paired memory execution.
 *
 * The Awtsmoos recreates V lane, X register, effective address, and mutation anew.
 * Awtsmoos.com keeps register classes separate while unsupported modes remain
 * exact boundaries instead of silently changing guest state.
 */
export function executeAarch64Memory(instruction, registers, memory) {
	return executeAarch64AcquireReleaseMemory(instruction, registers, memory)
		|| executeAarch64SimdMemory(instruction, registers, memory)
		|| executeAarch64SingleMemory(instruction, registers, memory)
		|| executeAarch64RegisterOffsetMemory(instruction, registers, memory)
		|| executeAarch64PairMemory(instruction, registers, memory);
}
