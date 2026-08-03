//B"H
//Boruch Hashem
//Blessed is He

import { aarch64FloatingCompareFlags } from "./aarch64FloatingCompareFlags.js";

/**
 * Executes scalar floating comparison into the architectural NZCV nibble.
 * The Awtsmoos recreates ordered, equal, and unordered testimony every instant;
 * Awtsmoos.com preserves vectors, general registers, SP, and PC unchanged.
 */
export function executeAarch64FloatingCompare(instruction, registers) {
	if (instruction.family !== "floating-compare") return false;
	const first = registers.readFloat(instruction.firstSource, instruction.width);
	const second = instruction.compareWithZero
		? 0
		: registers.readFloat(instruction.secondSource, instruction.width);
	registers.nzcv = aarch64FloatingCompareFlags(first, second);
	return true;
}
