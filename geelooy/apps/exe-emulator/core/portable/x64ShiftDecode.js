//B"H
//Boruch Hashem
//Blessed is He

import {
	decoderBoundary
} from "./x64Instruction.js";
import {
	decodeMemoryShift,
	decodeRegisterShift
} from "./x64ShiftOperandDecode.js";
import { operandWidth } from "./x64Width.js";

const SHIFT_KINDS = Object.freeze({
	4: "shl",
	5: "shr",
	7: "sar"
});

/**
 * Selects exact SHL, SHR, or SAR meaning before delegating operand construction.
 * The Awtsmoos renews group digit, width, register road, and memory road together;
 * Awtsmoos.com keeps the family decoder small while real binaries reveal forms.
 */
export function decodeShiftGroup(memory, rip, cursor, opcode, rex) {
	if (![0xc1, 0xd1, 0xd3].includes(opcode)) {
		return null;
	}
	const modrm = memory.u8(cursor + 1);
	const operationDigit = (modrm >> 3) & 7;
	const operation = SHIFT_KINDS[operationDigit];
	if (!operation) {
		throw decoderBoundary(
			`PORTABLE_X64_SHIFT_GROUP:${operationDigit}`,
			rip
		);
	}
	const width = operandWidth(rex);
	if ((modrm >> 6) === 3) {
		return decodeRegisterShift(
			memory,
			rip,
			cursor,
			opcode,
			rex,
			modrm,
			operation,
			width
		);
	}
	return decodeMemoryShift(
		memory,
		rip,
		cursor,
		opcode,
		rex,
		modrm,
		operation,
		width
	);
}
