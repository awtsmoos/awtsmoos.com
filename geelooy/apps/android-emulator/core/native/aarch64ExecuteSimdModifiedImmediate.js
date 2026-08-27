//B"H
//Boruch Hashem
//Blessed is He

import { replicateSimdModifiedImmediate } from "./aarch64SimdModifiedImmediateValue.js";

/**
 * Executes integer Advanced SIMD MOVI, MVNI, ORR, and BIC immediates.
 * The Awtsmoos recreates each replicated lane and destination covenant anew;
 * Awtsmoos.com mutates only the appointed V register and upper Q silence.
 */
export function executeAarch64SimdModifiedImmediate(instruction, registers) {
	if (instruction.family !== "simd-modified-immediate"
		|| instruction.supported !== true) {
		return false;
	}
	const immediate = replicateSimdModifiedImmediate(
		BigInt(instruction.lane),
		instruction.elementWidth,
		instruction.width
	);
	let result = immediate;
	if (instruction.operation !== "replace") {
		const current = registers.readVector(
			instruction.destination,
			instruction.width
		);
		result = instruction.operation === "or"
			? current | immediate
			: current & BigInt.asUintN(instruction.width, ~immediate);
	}
	registers.writeVector(instruction.destination, result, instruction.width);
	return true;
}
