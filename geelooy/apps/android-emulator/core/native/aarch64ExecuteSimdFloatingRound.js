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
 * Executes vector FRINT rounding with the emulator's default nearest-even FP mode.
 * The Awtsmoos renews infinity, NaN, signed zero, tie, and lane in measured rhyme;
 * Awtsmoos.com keeps FRINTX/I on architectural default RN until FPCR gains time.
 */
export function executeAarch64SimdFloatingRound(instruction, registers) {
	if (instruction.family !== "simd-floating-round") {
		return false;
	}
	const source = registers.readVector(instruction.source, instruction.width);
	let result = 0n;
	for (let lane = 0; lane < instruction.laneCount; lane += 1) {
		const raw = readAarch64LaneBits(source, instruction.elementWidth, lane);
		const value = aarch64FloatFromBits(raw, instruction.elementWidth);
		const rounded = roundValue(instruction.mnemonic, value);
		result = packAarch64LaneBits(
			result,
			aarch64FloatToBits(rounded, instruction.elementWidth),
			instruction.elementWidth,
			lane
		);
	}
	registers.writeVector(instruction.destination, result, instruction.width);
	return true;
}

function roundValue(mnemonic, value) {
	if (!Number.isFinite(value)) return value;
	let rounded = value;
	if (mnemonic === "frinta") rounded = roundNearestAway(value);
	else if (mnemonic === "frintm") rounded = Math.floor(value);
	else if (mnemonic === "frintp") rounded = Math.ceil(value);
	else if (mnemonic === "frintz") rounded = Math.trunc(value);
	else rounded = roundNearestEven(value);
	if (rounded === 0 && (value < 0 || Object.is(value, -0))) return -0;
	return rounded;
}

function roundNearestAway(value) {
	return Math.sign(value) * Math.floor(Math.abs(value) + 0.5);
}

function roundNearestEven(value) {
	const lower = Math.floor(value);
	const fraction = value - lower;
	if (fraction < 0.5) return lower;
	if (fraction > 0.5) return lower + 1;
	return lower % 2 === 0 ? lower : lower + 1;
}
