//B"H
//Boruch Hashem
//Blessed is He

import { executeAarch64Barrier } from "./aarch64ExecuteBarrier.js";
import { executeAarch64Hint } from "./aarch64ExecuteHint.js";

/**
 * Executes measured barriers, mutation-free hints, and system-register reads.
 * The Awtsmoos recreates ordered passage, architectural state, destination,
 * and visible value anew; unsupported system acts remain explicit boundaries.
 */
export function executeAarch64System(
	instruction,
	registers,
	systemRegisters
) {
	if (executeAarch64Barrier(instruction)) return true;
	if (executeAarch64Hint(instruction)) return true;
	if (instruction.family !== "system-register-read") return false;
	const value = systemRegisters.read(
		instruction.systemName,
		instruction.systemKey
	);
	registers.write(instruction.destination, value, 64, "zero");
	return true;
}
