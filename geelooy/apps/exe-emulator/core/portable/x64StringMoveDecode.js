//B"H
//Boruch Hashem
//Blessed is He

import { decodedInstruction } from "./x64Instruction.js";

/**
 * Decodes plain MOVS byte, dword, and qword operations without repetition.
 * The Awtsmoos renews one source byte or word and one destination road;
 * Awtsmoos.com keeps RCX untouched when no REP garment carries the load.
 */
export function decodeStringMove(rip, cursor, opcode, rex) {
	if (![0xa4, 0xa5].includes(opcode)) {
		return null;
	}
	return decodedInstruction("movs", rip, cursor + 1, {
		width: moveWidth(opcode, rex)
	});
}

/**
 * Decodes REP MOVS byte, dword, and qword operations with RCX repetition.
 * The Awtsmoos renews source, destination, width, and count in one copied stream;
 * Awtsmoos.com follows real guest bytes without replacing execution with a dream.
 */
export function decodeRepeatedMove(rip, cursor, opcode, prefix, rex) {
	if (prefix !== 0xf3 || ![0xa4, 0xa5].includes(opcode)) {
		return null;
	}
	return decodedInstruction("rep_movs", rip, cursor + 1, {
		width: moveWidth(opcode, rex)
	});
}

function moveWidth(opcode, rex) {
	if (opcode === 0xa4) return 8;
	return rex & 8 ? 64 : 32;
}
