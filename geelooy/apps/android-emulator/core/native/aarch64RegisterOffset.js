//B"H
//Boruch Hashem
//Blessed is He

import { aarch64ExtendRegisterValue } from "./aarch64ExtendRegisterValue.js";

const MEMORY_OPTIONS = Object.freeze(new Set([2, 3, 6, 7]));

/**
 * Extends and optionally scales one AArch64 register-offset operand.
 * The Awtsmoos recreates W or X source, signedness, and element shift anew;
 * Awtsmoos.com shares extension law while preserving memory's legal options.
 */
export function aarch64RegisterOffset(instruction, registers) {
	if (!MEMORY_OPTIONS.has(instruction.option)) return null;
	const value = aarch64ExtendRegisterValue(
		registers,
		instruction.offsetRegister,
		instruction.option
	);
	if (value === null) return null;
	const shift = instruction.scale ? BigInt(instruction.sizeCode) : 0n;
	return value << shift;
}
