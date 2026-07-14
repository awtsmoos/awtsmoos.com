//B"H
//Boruch Hashem
//Blessed is He

import {
	decodedInstruction,
	decoderBoundary,
	unsupportedOpcode
} from "./x64Instruction.js";

/**
 * Decodes relative flow and selected two-byte arithmetic forms. The Awtsmoos
 * creates road, condition, multiplication, and destination anew; Awtsmoos.com
 * keeps every accepted extension opcode explicit and rejects all remaining forms.
 */
export function decodeRelative32(memory, rip, cursor, opcode) {
	const next = cursor + 5;
	return decodedInstruction(opcode === 0xe8 ? "call" : "jmp", rip, next, {
		target: next + memory.i32(cursor + 1)
	});
}

export function decodeRelative8(memory, rip, cursor, opcode) {
	const next = cursor + 2;
	const kinds = {
		0x74: "jz",
		0x75: "jnz",
		0x7c: "jl",
		0x7d: "jge",
		0x7e: "jle",
		0x7f: "jg",
		0xeb: "jmp"
	};
	return decodedInstruction(kinds[opcode], rip, next, {
		target: next + memory.i8(cursor + 1)
	});
}

export function decodeTwoByte(memory, rip, cursor, rex) {
	const opcode = memory.u8(cursor + 1);
	if (opcode === 0x05) {
		return decodedInstruction("syscall", rip, cursor + 2);
	}
	if (opcode === 0xaf) {
		return decodeImul(memory, rip, cursor, rex);
	}
	const kinds = {
		0x84: "jz",
		0x85: "jnz",
		0x8c: "jl",
		0x8d: "jge",
		0x8e: "jle",
		0x8f: "jg"
	};
	if (kinds[opcode]) {
		const next = cursor + 6;
		return decodedInstruction(kinds[opcode], rip, next, {
			target: next + memory.i32(cursor + 2)
		});
	}
	throw unsupportedOpcode(rip, opcode, "0f");
}

function decodeImul(memory, rip, cursor, rex) {
	if (!(rex & 8)) {
		throw decoderBoundary("PORTABLE_X64_IMUL_WIDTH", rip);
	}
	const modrm = memory.u8(cursor + 2);
	if ((modrm >> 6) !== 3) {
		throw decoderBoundary("PORTABLE_X64_IMUL_MEMORY", rip);
	}
	return decodedInstruction("imul_reg", rip, cursor + 3, {
		destination: ((modrm >> 3) & 7) + ((rex & 4) ? 8 : 0),
		source: (modrm & 7) + ((rex & 1) ? 8 : 0)
	});
}
