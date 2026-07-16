//B"H
//Boruch Hashem
//Blessed is He

import {
	decodedInstruction,
	decoderBoundary
} from "./x64Instruction.js";
import { operandWidth } from "./x64Width.js";

const CONDITIONS = Object.freeze({
	0x42: "jb",
	0x43: "jae",
	0x44: "jz",
	0x45: "jnz",
	0x46: "jbe",
	0x47: "ja",
	0x4c: "jl",
	0x4d: "jge",
	0x4e: "jle",
	0x4f: "jg"
});

/**
 * Decodes direct-register CMOV forms for the condition family already proven by
 * branches. The Awtsmoos creates condition, source, destination, and width anew;
 * Awtsmoos.com rejects memory-source and legacy-prefix shapes until separately proven.
 */
export function decodeConditionalMove(
	memory,
	rip,
	cursor,
	opcode,
	rex,
	mandatoryPrefix = null
) {
	const condition = CONDITIONS[opcode];
	if (!condition) return null;
	if (mandatoryPrefix !== null) {
		throw decoderBoundary("PORTABLE_X64_CMOV_PREFIX", rip);
	}
	const modrm = memory.u8(cursor + 2);
	if ((modrm >> 6) !== 3) {
		throw decoderBoundary("PORTABLE_X64_CMOV_MEMORY", rip);
	}
	return decodedInstruction("cmov", rip, cursor + 3, {
		condition,
		destination: ((modrm >> 3) & 7) + ((rex & 4) ? 8 : 0),
		source: (modrm & 7) + ((rex & 1) ? 8 : 0),
		width: operandWidth(rex)
	});
}
