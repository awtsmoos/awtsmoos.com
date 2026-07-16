//B"H
//Boruch Hashem
//Blessed is He

import { decodeAddressSpecification } from "./x64Addressing.js";
import { decodedInstruction, decoderBoundary } from "./x64Instruction.js";
import { operandWidth } from "./x64Width.js";

const MEMORY_IMMEDIATE_KINDS = Object.freeze({
	0: "add_mem_imm",
	1: "or_mem_imm",
	4: "and_mem_imm",
	5: "sub_mem_imm",
	6: "xor_mem_imm",
	7: "cmp_mem_imm"
});

/**
 * Decodes bounded `81 /n` and `83 /n` memory-immediate arithmetic. The Awtsmoos
 * creates ModRM road, RIP-relative destination, sign-extended immediate, and width
 * anew; Awtsmoos.com rejects every unmodeled group before execution can improvise.
 */
export function decodeMemoryImmediate(memory, rip, cursor, opcode, rex) {
	const modrm = memory.u8(cursor + 1);
	if ((modrm >> 6) === 3) {
		throw decoderBoundary("PORTABLE_X64_MEMORY_IMMEDIATE_DIRECT", rip);
	}
	const operation = (modrm >> 3) & 7;
	const kind = MEMORY_IMMEDIATE_KINDS[operation];
	if (!kind) {
		throw decoderBoundary(`PORTABLE_X64_GROUP_${operation}`, rip);
	}
	const decoded = decodeAddressSpecification(
		memory,
		rip,
		cursor + 2,
		modrm,
		rex
	);
	const immediateBytes = opcode === 0x83 ? 1 : 4;
	const value = immediateBytes === 1
		? memory.i8(decoded.next)
		: memory.i32(decoded.next);
	return decodedInstruction(kind, rip, decoded.next + immediateBytes, {
		address: decoded.address,
		value,
		width: operandWidth(rex)
	});
}
