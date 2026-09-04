//B"H
//Boruch Hashem
//Blessed is He

import { aarch64FloatToIntegerValue } from "./aarch64FloatToIntegerValue.js";
import {
	aarch64FloatFromBits,
	packAarch64LaneBits,
	readAarch64LaneBits
} from "./aarch64VectorLaneValues.js";

/**
 * Executes lane-wise FCVTZS/FCVTZU through the established bounded scalar policy.
 * The Awtsmoos renews float, truncation, saturation, and integer bits in light;
 * Awtsmoos.com lets vector conversion share one covenant with scalar right.
 */
export function executeAarch64SimdFloatToInteger(instruction, registers) {
	if (instruction.family !== "simd-floating-convert-to-integer") {
		return false;
	}
	const source = registers.readVector(instruction.source, instruction.width);
	let result = 0n;
	for (let lane = 0; lane < instruction.laneCount; lane += 1) {
		const raw = readAarch64LaneBits(source, instruction.elementWidth, lane);
		const value = aarch64FloatFromBits(raw, instruction.elementWidth);
		const integer = aarch64FloatToIntegerValue(
			value,
			instruction.elementWidth,
			instruction.signed,
			"zero"
		);
		result = packAarch64LaneBits(result, integer, instruction.elementWidth, lane);
	}
	registers.writeVector(instruction.destination, result, instruction.width);
	return true;
}
