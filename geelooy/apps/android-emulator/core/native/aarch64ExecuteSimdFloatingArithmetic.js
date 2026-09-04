//B"H
//Boruch Hashem
//Blessed is He

import {
	aarch64FloatFromBits,
	aarch64FloatToBits,
	packAarch64LaneBits,
	readAarch64LaneBits
} from "./aarch64VectorLaneValues.js";

/**
 * Executes vector floating two-source arithmetic from immutable source snapshots.
 * The Awtsmoos renews every IEEE lane while aliasing cannot bend the source light;
 * Awtsmoos.com lets real Flutter multiplication flow without a package-named rite.
 */
export function executeAarch64SimdFloatingArithmetic(instruction, registers) {
	if (instruction.family !== "simd-floating-arithmetic") {
		return false;
	}
	const left = registers.readVector(instruction.source, instruction.width);
	const right = registers.readVector(instruction.secondSource, instruction.width);
	let result = 0n;
	for (let lane = 0; lane < instruction.laneCount; lane += 1) {
		const first = readFloat(left, instruction.elementWidth, lane);
		const second = readFloat(right, instruction.elementWidth, lane);
		const value = calculate(instruction.mnemonic, first, second);
		result = packAarch64LaneBits(
			result,
			aarch64FloatToBits(value, instruction.elementWidth),
			instruction.elementWidth,
			lane
		);
	}
	registers.writeVector(instruction.destination, result, instruction.width);
	return true;
}

function readFloat(bits, width, lane) {
	return aarch64FloatFromBits(readAarch64LaneBits(bits, width, lane), width);
}

function calculate(mnemonic, first, second) {
	if (mnemonic === "fmul") return first * second;
	if (mnemonic === "fadd") return first + second;
	if (mnemonic === "fsub") return first - second;
	return first / second;
}
