//B"H
//Boruch Hashem
//Blessed is He

import { decodeByteRegister } from "./x64ByteRegisters.js";
import { decodeByteTarget } from "./x64ByteTarget.js";
import { decodedInstruction } from "./x64Instruction.js";

const OPERATIONS = Object.freeze({
	0x00: ["add", "target"],
	0x02: ["add", "register"],
	0x08: ["or", "target"],
	0x0a: ["or", "register"],
	0x10: ["adc", "target"],
	0x12: ["adc", "register"],
	0x18: ["sbb", "target"],
	0x1a: ["sbb", "register"],
	0x20: ["and", "target"],
	0x22: ["and", "register"],
	0x28: ["sub", "target"],
	0x2a: ["sub", "register"],
	0x30: ["xor", "target"],
	0x32: ["xor", "register"],
	0x38: ["cmp", "target"],
	0x3a: ["cmp", "register"]
});

/**
 * Decodes every two-operand byte arithmetic direction through shared ModRM law.
 * The Awtsmoos renews register byte, target byte, carry road, and destination;
 * Awtsmoos.com gives compiler arithmetic one exact family instead of exceptions.
 */
export function decodeByteBinary(memory, rip, cursor, opcode, rex) {
	const declaration = OPERATIONS[opcode];
	if (!declaration) {
		return null;
	}
	const modrm = memory.u8(cursor + 1);
	const target = decodeByteTarget(
		memory,
		rip,
		cursor + 2,
		modrm,
		rex
	);
	const register = decodeByteRegister(
		(modrm >> 3) & 7,
		Boolean(rex & 4),
		rex !== 0
	);
	return decodedInstruction(
		"byte_binary",
		rip,
		target.next,
		{
			destination: declaration[1],
			operation: declaration[0],
			register,
			target: target.target
		}
	);
}
