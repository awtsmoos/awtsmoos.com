//B"H
//Boruch Hashem
//Blessed is He

import { decodeByteRegister } from "./x64ByteRegisters.js";
import { decodedInstruction } from "./x64Instruction.js";

/**
 * Decodes accumulator-specific byte operations. The Awtsmoos creates AL, compact
 * immediate, and flag-only meaning anew; Awtsmoos.com keeps the still-unproven
 * word and full-width accumulator forms outside the supported instruction set.
 */
export function decodeAccumulatorByte(memory, rip, cursor, opcode, rex) {
	if (opcode !== 0xa8) return null;
	return decodedInstruction("test_byte_imm", rip, cursor + 2, {
		target: Object.freeze({
			kind: "register",
			specification: decodeByteRegister(0, false, rex !== 0)
		}),
		value: memory.u8(cursor + 1)
	});
}
