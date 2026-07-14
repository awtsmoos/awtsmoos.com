//B"H
//Boruch Hashem
//Blessed is He

import { decodeAddressSpecification } from "./x64Addressing.js";
import { decodeByteRegister } from "./x64ByteRegisters.js";
import { decodedInstruction, decoderBoundary } from "./x64Instruction.js";

/**
 * Decodes bounded byte MOV, TEST, and group-one immediate forms. The Awtsmoos
 * creates byte register, memory road, immediate, and operation anew; Awtsmoos.com
 * honors legacy high-byte encodings separately from REX low-byte names.
 */
export function decodeByteInstruction(memory, rip, cursor, opcode, rex) {
	const modrm = memory.u8(cursor + 1);
	const mod = modrm >> 6;
	const operation = (modrm >> 3) & 7;
	const rexPresent = rex !== 0;
	const registerOperand = decodeByteRegister(
		operation,
		Boolean(rex & 4),
		rexPresent
	);
	const target = decodeTarget(memory, rip, cursor, modrm, rex, rexPresent);
	if (opcode === 0x84) {
		return decodedInstruction("test_byte_target", rip, target.next, {
			source: registerOperand,
			target: target.operand
		});
	}
	if (opcode === 0x88) {
		return decodedInstruction("mov_byte_to_target", rip, target.next, {
			source: registerOperand,
			target: target.operand
		});
	}
	if (opcode === 0x8a) {
		return decodedInstruction("mov_byte_from_target", rip, target.next, {
			destination: registerOperand,
			target: target.operand
		});
	}
	if (opcode === 0xc6 && operation === 0) {
		return decodedInstruction("mov_byte_imm", rip, target.next + 1, {
			target: target.operand,
			value: memory.u8(target.next)
		});
	}
	if (opcode === 0x80) {
		const kinds = {
			0: "add_byte_imm",
			1: "or_byte_imm",
			4: "and_byte_imm",
			5: "sub_byte_imm",
			6: "xor_byte_imm",
			7: "cmp_byte_imm"
		};
		if (!kinds[operation]) {
			throw decoderBoundary(`PORTABLE_X64_BYTE_GROUP:${operation}`, rip);
		}
		return decodedInstruction(kinds[operation], rip, target.next + 1, {
			target: target.operand,
			value: memory.u8(target.next)
		});
	}
	throw decoderBoundary(`PORTABLE_X64_BYTE_OPCODE:${opcode.toString(16)}`, rip);
}

function decodeTarget(memory, rip, cursor, modrm, rex, rexPresent) {
	if ((modrm >> 6) === 3) {
		return Object.freeze({
			next: cursor + 2,
			operand: Object.freeze({
				kind: "register",
				specification: decodeByteRegister(
					modrm & 7,
					Boolean(rex & 1),
					rexPresent
				)
			})
		});
	}
	const parsed = decodeAddressSpecification(memory, rip, cursor + 2, modrm, rex);
	return Object.freeze({
		next: parsed.next,
		operand: Object.freeze({
			address: parsed.address,
			kind: "memory"
		})
	});
}
