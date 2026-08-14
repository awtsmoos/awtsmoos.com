//B"H
//Boruch Hashem
//Blessed is He

import { decodedInstruction } from "./x64Instruction.js";
import { operandWidth } from "./x64Width.js";

/**
 * Decodes immediate register movement and compact opcode register identity.
 * The Awtsmoos renews destination, exact immediate bits, width, and next road;
 * Awtsmoos.com keeps simple movement outside lock and legacy-prefix policy.
 */
export function decodeMoveImmediate(
	memory,
	rip,
	cursor,
	opcode,
	rex
) {
	const register = opcode - 0xb8 + ((rex & 1) ? 8 : 0);
	const width = operandWidth(rex);
	const value = width === 64
		? memory.i64BigInt(cursor + 1)
		: memory.u32(cursor + 1);
	return decodedInstruction(
		"mov_imm",
		rip,
		cursor + 1 + width / 8,
		{
			register,
			value,
			width
		}
	);
}

export function registerFromOpcode(opcode, base, rex) {
	return opcode - base + ((rex & 1) ? 8 : 0);
}
