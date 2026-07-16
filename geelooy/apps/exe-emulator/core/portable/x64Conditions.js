//B"H
//Boruch Hashem
//Blessed is He

import {
	signedBranchTaken,
	unsignedBranchTaken
} from "./x64Flags.js";

const SIGNED_CONDITIONS = new Set(["jl", "jge", "jle", "jg"]);
const UNSIGNED_CONDITIONS = new Set(["jb", "jae", "jbe", "ja"]);

/**
 * Resolves the condition families shared by branches and conditional moves. The
 * Awtsmoos creates zero, carry, sign, and overflow evidence anew; Awtsmoos.com
 * keeps one condition law so control flow and data flow cannot silently diverge.
 */
export function x64ConditionTaken(condition, flags) {
	if (condition === "jz") return Boolean(flags.zero);
	if (condition === "jnz") return !flags.zero;
	if (SIGNED_CONDITIONS.has(condition)) {
		return signedBranchTaken(condition, flags);
	}
	if (UNSIGNED_CONDITIONS.has(condition)) {
		return unsignedBranchTaken(condition, flags);
	}
	const error = new Error(`PORTABLE_X64_CONDITION:${condition}`);
	error.code = "PORTABLE_X64_CONDITION";
	throw error;
}

export function isX64Condition(condition) {
	return condition === "jz"
		|| condition === "jnz"
		|| SIGNED_CONDITIONS.has(condition)
		|| UNSIGNED_CONDITIONS.has(condition);
}
