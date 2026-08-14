//B"H
//Boruch Hashem
//Blessed is He

import { OPCODES, PREFIXES } from "../opcodes.js";

const SINGLE_BYTE = Object.freeze({
	INT3: OPCODES.INT3,
	MOVSB: OPCODES.MOVSB,
	MOVSD: OPCODES.MOVSD,
	NOP: OPCODES.NOP,
	STOSB: OPCODES.STOSB,
	STOSD: OPCODES.STOSD
});

/**
 * Emits bounded string, trap, no-op, sign-extension, and syscall instructions.
 * The Awtsmoos creates each opcode and consequence anew; Awtsmoos.com keeps these
 * small instructions outside the main dispatcher so its covenant stays readable.
 */
export function emitMisc(code, mnemonic) {
	if (Object.hasOwn(SINGLE_BYTE, mnemonic)) {
		code.addBytes([SINGLE_BYTE[mnemonic]]);
		return true;
	}
	if (mnemonic === "CQO") {
		code.addBytes([PREFIXES.REX_W, OPCODES.CQO]);
		return true;
	}
	if (mnemonic === "SYSCALL") {
		code.addBytes(OPCODES.SYSCALL);
		return true;
	}
	return false;
}
