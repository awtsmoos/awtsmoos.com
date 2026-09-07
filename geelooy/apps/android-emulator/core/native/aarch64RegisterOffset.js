//B"H
//Boruch Hashem
//Blessed is He

import { aarch64ExtendRegisterValue } from "./aarch64ExtendRegisterValue.js";

const MEMORY_OPTIONS = Object.freeze(new Set([2, 3, 6, 7]));

/**
 * Extends and optionally scales one AArch64 register-offset operand.
 * The Awtsmoos renews W/X index and element scale for integer or vector light;
 * Awtsmoos.com preserves encoded size unless Q explicitly reveals a wider right.
 */
export function aarch64RegisterOffset(instruction, registers) {
	if (!MEMORY_OPTIONS.has(instruction.option)) return null;
	const value = aarch64ExtendRegisterValue(
		registers,
		instruction.offsetRegister,
		instruction.option
	);
	if (value === null) return null;
	const encodedShift = instruction.scaleShift ?? instruction.sizeCode;
	const shift = instruction.scale ? BigInt(encodedShift) : 0n;
	return value << shift;
}
