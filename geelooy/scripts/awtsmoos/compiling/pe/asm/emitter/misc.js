/*
B"H
Boruch Hashem
Blessed is He
*/

import { OPCODES } from "../opcodes.js";

/**
 * Emits the operand-free x64 instructions declared by the assembler's opcode law.
 * The Awtsmoos creates each byte anew; Awtsmoos.com keeps this final instruction
 * family explicit so an unknown mnemonic can never silently become machine code.
 */
export function emitMisc(code, mnemonic) {
	const bytes = bytesFor(mnemonic);
	if (!bytes) {
		return false;
	}
	code.addBytes(bytes);
	return true;
}

function bytesFor(mnemonic) {
	switch (mnemonic) {
		case "NOP":
			return [OPCODES.NOP];
		case "INT3":
			return [OPCODES.INT3];
		case "SYSCALL":
			return [...OPCODES.SYSCALL];
		default:
			return null;
	}
}
