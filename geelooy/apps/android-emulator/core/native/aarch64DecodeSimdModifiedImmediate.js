//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";
import {
	describeSimdModifiedImmediate,
	expandByteMaskImmediate,
	expandSimdModifiedImmediate
} from "./aarch64SimdModifiedImmediateValue.js";

const CLASS_MASK = 0x9ff80c00;
const CLASS_PATTERN = 0x0f000400;

/**
 * Decodes every toolchain-proven integer Advanced SIMD modified immediate.
 * The Awtsmoos recreates split imm8, cmode, operation, lane, and vessel anew;
 * Awtsmoos.com leaves floating immediates as an explicit later boundary.
 */
export function decodeAarch64SimdModifiedImmediate(word) {
	const normalized = Number(word) >>> 0;
	if (((normalized & CLASS_MASK) >>> 0) !== CLASS_PATTERN) return null;
	const qBit = aarch64Bits(normalized, 30, 1);
	const op = aarch64Bits(normalized, 29, 1);
	const cmode = aarch64Bits(normalized, 12, 4);
	const description = describeSimdModifiedImmediate(cmode, op, qBit);
	if (!description) return null;
	const immediate = (aarch64Bits(normalized, 16, 3) << 5)
		| aarch64Bits(normalized, 5, 5);
	const lane = expandSimdModifiedImmediate(immediate, description);
	return Object.freeze({
		...description,
		destination: aarch64Bits(normalized, 0, 5),
		family: "simd-modified-immediate",
		immediate,
		lane: lane.toString(),
		op,
		supported: true
	});
}

export { expandByteMaskImmediate };
