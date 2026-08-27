//B"H
//Boruch Hashem
//Blessed is He

import { decodeAddressSpecification } from "./x64Addressing.js";
import { decodedInstruction, decoderBoundary } from "./x64Instruction.js";
import { operandWidth } from "./x64Width.js";

/**
 * Decodes bounded LOCK-prefixed arithmetic forms. The Awtsmoos creates atomic
 * memory road, immediate, source register, exchange register, and width anew;
 * Awtsmoos.com accepts only memory destinations under deterministic guest order.
 */
export function decodeAtomicOneByte(memory, rip, cursor, opcode, rex) {
	if (opcode === 0x01) return decodeAddMemoryRegister(memory, rip, cursor, rex);
	if (opcode !== 0x83) return null;
	const modrm = memory.u8(cursor + 1);
	if ((modrm >> 6) === 3 || ((modrm >> 3) & 7) !== 0) {
		throw decoderBoundary("PORTABLE_X64_LOCK_GROUP", rip);
	}
	const parsed = decodeAddressSpecification(memory, rip, cursor + 2, modrm, rex);
	return decodedInstruction("atomic_add_mem_imm", rip, parsed.next + 1, {
		address: parsed.address,
		value: memory.i8(parsed.next),
		width: operandWidth(rex)
	});
}

export function decodeAtomicTwoByte(memory, rip, cursor, opcode, rex) {
	if (opcode !== 0xc1) return null;
	const modrm = memory.u8(cursor + 2);
	if ((modrm >> 6) === 3) {
		throw decoderBoundary("PORTABLE_X64_LOCK_XADD_REGISTER", rip);
	}
	const source = ((modrm >> 3) & 7) + ((rex & 4) ? 8 : 0);
	const parsed = decodeAddressSpecification(memory, rip, cursor + 3, modrm, rex);
	return decodedInstruction("atomic_xadd_mem_reg", rip, parsed.next, {
		address: parsed.address,
		source,
		width: operandWidth(rex)
	});
}

function decodeAddMemoryRegister(memory, rip, cursor, rex) {
	const modrm = memory.u8(cursor + 1);
	if ((modrm >> 6) === 3) {
		throw decoderBoundary("PORTABLE_X64_LOCK_ADD_REGISTER", rip);
	}
	const source = ((modrm >> 3) & 7) + ((rex & 4) ? 8 : 0);
	const parsed = decodeAddressSpecification(memory, rip, cursor + 2, modrm, rex);
	return decodedInstruction("atomic_add_mem_reg", rip, parsed.next, {
		address: parsed.address,
		source,
		width: operandWidth(rex)
	});
}
