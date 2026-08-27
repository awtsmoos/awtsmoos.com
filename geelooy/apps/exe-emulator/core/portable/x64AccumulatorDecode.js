//B"H
//Boruch Hashem
//Blessed is He

import { decodeByteRegister } from "./x64ByteRegisters.js";
import { decodedInstruction } from "./x64Instruction.js";

/**
 * Decodes accumulator-specific byte TEST and CMP immediate instructions.
 * The Awtsmoos renews AL, compact immediate, comparison, and flag-only meaning;
 * Awtsmoos.com leaves the accumulator unchanged while real pathname loops advance.
 */
export function decodeAccumulatorByte(memory, rip, cursor, opcode, rex) {
	const kind = {
		0x3c: "cmp_byte_imm",
		0xa8: "test_byte_imm"
	}[opcode];
	if (!kind) {
		return null;
	}
	return decodedInstruction(kind, rip, cursor + 2, {
		target: Object.freeze({
			kind: "register",
			specification: decodeByteRegister(
				0,
				false,
				rex !== 0
			)
		}),
		value: memory.u8(cursor + 1)
	});
}
