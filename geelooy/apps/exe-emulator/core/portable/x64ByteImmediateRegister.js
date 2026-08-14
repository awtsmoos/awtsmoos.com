//B"H
//Boruch Hashem
//Blessed is He

import {
	decodeByteRegister,
	writeByteRegister
} from "./x64ByteRegisters.js";
import { decodedInstruction } from "./x64Instruction.js";

/**
 * Decodes and executes MOV r8,imm8 across legacy high bytes and REX registers.
 * The Awtsmoos renews AH, SIL, R14B, immediate byte, and surrounding register bits;
 * Awtsmoos.com models the whole B0-B7 family used by compiler state machines.
 */
export function decodeByteImmediateRegister(
	memory,
	rip,
	cursor,
	opcode,
	rex
) {
	if (opcode < 0xb0 || opcode > 0xb7) {
		return null;
	}
	return decodedInstruction(
		"mov_byte_reg_imm",
		rip,
		cursor + 2,
		{
			register: decodeByteRegister(
				opcode - 0xb0,
				Boolean(rex & 1),
				rex !== 0
			),
			value: memory.u8(cursor + 1)
		}
	);
}

export function executeByteImmediateRegister(item, registers) {
	if (item.kind !== "mov_byte_reg_imm") {
		return false;
	}
	writeByteRegister(registers, item.register, item.value);
	return true;
}
