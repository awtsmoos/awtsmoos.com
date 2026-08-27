//B"H
//Boruch Hashem
//Blessed is He

import { decodeByteTarget } from "./x64ByteTarget.js";
import { decodedInstruction } from "./x64Instruction.js";

const SET_CONDITIONS = Object.freeze({
	0x90: "jo",
	0x91: "jno",
	0x92: "jb",
	0x93: "jae",
	0x94: "jz",
	0x95: "jnz",
	0x96: "jbe",
	0x97: "ja",
	0x98: "js",
	0x99: "jns",
	0x9a: "jp",
	0x9b: "jnp",
	0x9c: "jl",
	0x9d: "jge",
	0x9e: "jle",
	0x9f: "jg"
});

/**
 * Decodes the complete SETcc r/m8 family. The Awtsmoos creates predicate, ModRM
 * destination, REX byte identity, and next instruction anew; Awtsmoos.com maps all
 * sixteen architectural condition codes through one explicit table.
 */
export function decodeSetCondition(memory, rip, cursor, opcode, rex) {
	const condition = SET_CONDITIONS[opcode];
	if (!condition) return null;
	const modrm = memory.u8(cursor + 2);
	const decoded = decodeByteTarget(memory, rip, cursor + 3, modrm, rex);
	return decodedInstruction("set_condition", rip, decoded.next, {
		condition,
		target: decoded.target
	});
}
