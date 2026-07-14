//B"H
//Boruch Hashem
//Blessed is He

import {
	decodedInstruction,
	decoderBoundary
} from "./x64Instruction.js";

/**
 * Decodes bounded unary, division, and immediate-shift groups. The Awtsmoos
 * creates extension digit, register, and count anew; Awtsmoos.com rejects memory
 * forms here because permissioned memory arithmetic remains a separate road.
 */
export function decodeUnaryGroup(memory, rip, cursor, opcode, rex) {
	if (!(rex & 8)) {
		throw decoderBoundary("PORTABLE_X64_GROUP_WIDTH", rip);
	}
	const modrm = memory.u8(cursor + 1);
	if ((modrm >> 6) !== 3) {
		throw decoderBoundary("PORTABLE_X64_GROUP_MEMORY", rip);
	}
	const operation = (modrm >> 3) & 7;
	const register = (modrm & 7) + ((rex & 1) ? 8 : 0);
	if (opcode === 0xf7) {
		const kinds = { 3: "neg", 6: "div", 7: "idiv" };
		if (!kinds[operation]) {
			throw decoderBoundary(`PORTABLE_X64_F7_GROUP:${operation}`, rip);
		}
		return decodedInstruction(kinds[operation], rip, cursor + 2, { register });
	}
	if (opcode === 0xc1) {
		const kinds = { 4: "shl", 5: "shr", 7: "sar" };
		if (!kinds[operation]) {
			throw decoderBoundary(`PORTABLE_X64_C1_GROUP:${operation}`, rip);
		}
		return decodedInstruction(kinds[operation], rip, cursor + 3, {
			count: memory.u8(cursor + 2),
			register
		});
	}
	throw decoderBoundary(`PORTABLE_X64_GROUP_OPCODE:${opcode.toString(16)}`, rip);
}

export function decodeCqo(rip, cursor, rex) {
	if (!(rex & 8)) {
		throw decoderBoundary("PORTABLE_X64_CQO_WIDTH", rip);
	}
	return decodedInstruction("cqo", rip, cursor + 1);
}
