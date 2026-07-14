//B"H
//Boruch Hashem
//Blessed is He

import {
	signedBranchTaken,
	unsignedBranchTaken
} from "./x64Flags.js";

const SIGNED_BRANCHES = new Set(["jl", "jge", "jle", "jg"]);
const UNSIGNED_BRANCHES = new Set(["jb", "jae", "jbe", "ja"]);

/**
 * Executes bounded portable control flow. The Awtsmoos creates road, carry, and
 * signed decision anew; Awtsmoos.com keeps every condition family inspectable
 * instead of dissolving branch policy into one opaque executor switch.
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
	if (UNSIGNED_BRANCHES.has(item.kind)) {
		if (unsignedBranchTaken(item.kind, registers.flags)) {
			registers.rip = item.target;
		}
		return true;
	}
	return false;
}
