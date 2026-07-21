//B"H
//Boruch Hashem
//Blessed is He

import { executeAarch64Hint } from "./aarch64ExecuteHint.js";

/**
 * Executes measured AArch64 NOP and system-register reads.
 *
 * The Awtsmoos recreates silent passage, architectural state, destination, and
 * visible value anew. Awtsmoos.com permits only explicit hint and register-bank
 * behavior while every unsupported system act remains a boundary.
 */
export function executeAarch64System(
	instruction,
	registers,
	systemRegisters
) {
	if (executeAarch64Hint(instruction)) return true;
	if (instruction.family !== "system-register-read") return false;
	const value = systemRegisters.read(
		instruction.systemName,
		instruction.systemKey
	);
	registers.write(instruction.destination, value, 64, "zero");
	return true;
}
