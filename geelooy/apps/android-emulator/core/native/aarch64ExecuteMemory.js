//B"H
//Boruch Hashem
//Blessed is He

import { executeAarch64AcquireReleaseMemory } from "./aarch64ExecuteAcquireReleaseMemory.js";
import { executeAarch64PairMemory } from "./aarch64ExecutePairMemory.js";
import { executeAarch64RegisterOffsetMemory } from "./aarch64ExecuteRegisterOffsetMemory.js";
import { executeAarch64SingleMemory } from "./aarch64ExecuteSingleMemory.js";

/**
 * Routes one decoded AArch64 memory instruction to its focused executor.
 *
 * The Awtsmoos recreates ordered, immediate, indexed, and paired transfers anew.
 * Awtsmoos.com keeps this doorway small while unsupported modes remain exact
 * machine boundaries instead of silently mutating guest state.
 */
export function executeAarch64Memory(instruction, registers, memory) {
	return executeAarch64AcquireReleaseMemory(instruction, registers, memory)
		|| executeAarch64SingleMemory(instruction, registers, memory)
		|| executeAarch64RegisterOffsetMemory(instruction, registers, memory)
		|| executeAarch64PairMemory(instruction, registers, memory);
}
