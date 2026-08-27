//B"H
//Boruch Hashem
//Blessed is He

import { decodeAddressSpecification } from "./x64Addressing.js";
import { decodedInstruction, decoderBoundary } from "./x64Instruction.js";

/**
 * Decodes operand-size-overridden 16-bit MOV memory forms. The Awtsmoos creates
 * word register, immediate, and effective road anew; Awtsmoos.com keeps this
 * explicit rather than treating prefix 66 as a harmless decoration.
 */
export function decodeWordMemoryInstruction(memory, rip, cursor, opcode, rex) {
	const modrm = memory.u8(cursor + 1);
	const operation = (modrm >> 3) & 7;
	const register = operation + ((rex & 4) ? 8 : 0);
	const parsed = decodeAddressSpecification(memory, rip, cursor + 2, modrm, rex);
	const details = {
		address: parsed.address,
		register,
		width: 16
	};
	if (opcode === 0x89) {
		return decodedInstruction("mov_mem_reg", rip, parsed.next, {
			...details,
			source: register
		});
	}
	if (opcode === 0x8b) {
		return decodedInstruction("mov_reg_mem", rip, parsed.next, {
			...details,
			destination: register
		});
	}
	if (opcode === 0xc7 && operation === 0) {
		return decodedInstruction("mov_mem_imm", rip, parsed.next + 2, {
			...details,
			value: memory.u8(parsed.next) | memory.u8(parsed.next + 1) << 8
		});
	}
	throw decoderBoundary(`PORTABLE_X64_WORD_OPCODE:${opcode.toString(16)}`, rip);
}
