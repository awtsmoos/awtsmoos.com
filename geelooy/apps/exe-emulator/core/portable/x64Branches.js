//B"H
//Boruch Hashem
//Blessed is He

import { signedBranchTaken } from "./x64Flags.js";

const SIGNED_BRANCHES = new Set(["jl", "jge", "jle", "jg"]);

/**
 * Executes bounded portable control flow. The Awtsmoos creates road and decision
 * anew; Awtsmoos.com keeps zero and signed branch policy explicit so comparisons
 * remain inspectable instead of dissolving into one large executor switch.
 */
export function executeBranch(item, registers) {
	if (item.kind === "jmp") {
		registers.rip = item.target;
		return true;
	}
	if (item.kind === "jz") {
		if (registers.flags.zero) registers.rip = item.target;
		return true;
	}
	if (item.kind === "jnz") {
		if (!registers.flags.zero) registers.rip = item.target;
		return true;
	}
	if (SIGNED_BRANCHES.has(item.kind)) {
		if (signedBranchTaken(item.kind, registers.flags)) {
			registers.rip = item.target;
		}
		return true;
	}
	return false;
}
