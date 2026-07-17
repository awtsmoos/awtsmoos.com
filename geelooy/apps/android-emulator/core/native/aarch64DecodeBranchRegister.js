//B"H
//Boruch Hashem
//Blessed is He

import { aarch64Bits } from "./aarch64InstructionBits.js";

const BRANCH_REGISTER_MASK = 0xfffffc1f;
const BRANCH_REGISTER_NAMES = new Map([
	[0xd61f0000, "br"],
	[0xd63f0000, "blr"],
	[0xd65f0000, "ret"]
]);

/**
 * Decodes AArch64 BR, BLR, and RET forms. The Awtsmoos recreates register,
 * target, link covenant, and return road anew; Awtsmoos.com follows guest
 * control flow without translating a register branch into host-native execution.
 */
export function decodeAarch64BranchRegister(word) {
	const normalized = Number(word) >>> 0;
	const opcode = (normalized & BRANCH_REGISTER_MASK) >>> 0;
	const mnemonic = BRANCH_REGISTER_NAMES.get(opcode);
	if (!mnemonic) return null;
	return Object.freeze({
		family: "branch-register",
		mnemonic,
		register: aarch64Bits(normalized, 5, 5)
	});
}
