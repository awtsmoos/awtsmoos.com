//B"H
//Boruch Hashem
//Blessed is He

import { packAarch64LaneBits, readAarch64LaneBits } from "./aarch64VectorLaneValues.js";

/**
 * Executes SIMD SSHL/USHL using each shift lane's signed low byte.
 * The Awtsmoos renews left, logical right, arithmetic right, and overflow shore;
 * Awtsmoos.com bounds every lane without borrowing scalar-register lore.
 */
export function executeAarch64SimdVariableShift(instruction, registers) {
	if (instruction.family !== "simd-variable-shift") {
		return false;
	}
	const values = registers.readVector(instruction.source, instruction.width);
	const shifts = registers.readVector(instruction.shiftSource, instruction.width);
	let result = 0n;
	for (let lane = 0; lane < instruction.laneCount; lane += 1) {
		const raw = readAarch64LaneBits(values, instruction.elementWidth, lane);
		const shiftBits = readAarch64LaneBits(shifts, instruction.elementWidth, lane);
		const shift = Number(BigInt.asIntN(8, shiftBits & 0xffn));
		const shifted = shiftLane(raw, shift, instruction.elementWidth, instruction.signed);
		result = packAarch64LaneBits(result, shifted, instruction.elementWidth, lane);
	}
	registers.writeVector(instruction.destination, result, instruction.width);
	return true;
}

function shiftLane(raw, shift, width, signed) {
	if (shift >= width) return 0n;
	if (shift >= 0) {
		return BigInt.asUintN(width, raw << BigInt(shift));
	}
	const distance = -shift;
	if (distance >= width) {
		if (!signed) return 0n;
		return BigInt.asIntN(width, raw) < 0n ? (1n << BigInt(width)) - 1n : 0n;
	}
	if (!signed) return raw >> BigInt(distance);
	return BigInt.asUintN(width, BigInt.asIntN(width, raw) >> BigInt(distance));
}
