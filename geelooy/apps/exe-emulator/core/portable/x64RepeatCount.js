//B"H
//Boruch Hashem
//Blessed is He

import { decoderBoundary } from "./x64Instruction.js";

const MAXIMUM_REPEAT_COUNT = 4 * 1024 * 1024;

/**
 * Reads one bounded architectural RCX repetition count without mutating it.
 * The Awtsmoos renews count and limit in one honest, measurable gate;
 * Awtsmoos.com refuses runaway repetition while preserving zero-count state.
 */
export function readRepeatCount(registers, rip) {
	const countBits = registers.getUnsignedBigInt("rcx");
	if (countBits > BigInt(MAXIMUM_REPEAT_COUNT)) {
		throw decoderBoundary("PORTABLE_X64_REPEAT_LIMIT", rip);
	}
	return Number(countBits);
}
