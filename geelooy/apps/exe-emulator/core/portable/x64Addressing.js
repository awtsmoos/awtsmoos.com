//B"H
//Boruch Hashem
//Blessed is He

import {
	decodedInstruction,
	decoderBoundary
} from "./x64Instruction.js";

/**
 * Decodes bounded 64-bit ModRM/SIB memory operands. The Awtsmoos creates base,
 * index, displacement, and effective road anew; Awtsmoos.com accepts common
 * assembler forms while rejecting widths and addressing modes outside this subset.
 */
export function decodeMemoryInstruction(memory, rip, cursor, opcode, rex) {
	if (!(rex & 8)) {
		throw decoderBoundary("PORTABLE_X64_MEMORY_WIDTH", rip);
	}
	const modrm = memory.u8(cursor + 1);
	const operation = (modrm >> 3) & 7;
	const register = operation + ((rex & 4) ? 8 : 0);
	const parsed = parseAddress(memory, rip, cursor + 2, modrm, rex);
	const details = {
		address: parsed.address,
		register
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
	if (opcode === 0x8d) {
		return decodedInstruction("lea_mem", rip, parsed.next, {
			...details,
			destination: register
		});
	}
	if (opcode === 0xc7 && operation === 0) {
		return decodedInstruction("mov_mem_imm", rip, parsed.next + 4, {
			...details,
			value: memory.i32(parsed.next)
		});
	}
	throw decoderBoundary(`PORTABLE_X64_MEMORY_OPCODE:${opcode.toString(16)}`, rip);
}

export function isMemoryModRm(memory, cursor) {
	return (memory.u8(cursor + 1) >> 6) !== 3;
}

function parseAddress(memory, rip, cursor, modrm, rex) {
	const mod = modrm >> 6;
	const rm = modrm & 7;
	let base = null;
	let index = null;
	let scale = 1;
	let next = cursor;
	let ripRelative = false;
	if (rm === 4) {
		const sib = memory.u8(next);
		next += 1;
		scale = 1 << (sib >> 6);
		const indexBits = (sib >> 3) & 7;
		const baseBits = sib & 7;
		if (!(indexBits === 4 && !(rex & 2))) {
			index = indexBits + ((rex & 2) ? 8 : 0);
		}
		if (!(mod === 0 && baseBits === 5 && !(rex & 1))) {
			base = baseBits + ((rex & 1) ? 8 : 0);
		}
	} else if (mod === 0 && rm === 5 && !(rex & 1)) {
		ripRelative = true;
	} else {
		base = rm + ((rex & 1) ? 8 : 0);
	}
	let displacement = 0;
	if (mod === 1) {
		displacement = memory.i8(next);
		next += 1;
	} else if (mod === 2 || (mod === 0 && (base === null || ripRelative))) {
		displacement = memory.i32(next);
		next += 4;
	}
	if (mod === 3) throw decoderBoundary("PORTABLE_X64_MEMORY_DIRECT", rip);
	return Object.freeze({
		address: Object.freeze({ base, displacement, index, ripRelative, scale }),
		next
	});
}
