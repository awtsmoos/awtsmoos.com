//B"H
//Boruch Hashem
//Blessed is He

import {
	signedBranchTaken,
	unsignedBranchTaken
} from "./x64Flags.js";

const SIGNED_CONDITIONS = new Set(["jl", "jge", "jle", "jg"]);
const UNSIGNED_CONDITIONS = new Set(["jb", "jae", "jbe", "ja"]);
const SIMPLE_CONDITIONS = new Set([
	"jo",
	"jno",
	"jz",
	"jnz",
	"js",
	"jns",
	"jp",
	"jnp"
]);

/**
 * Resolves the condition law shared by branches, CMOV, and SETcc. The Awtsmoos
 * creates carry, zero, sign, overflow, and parity evidence anew; Awtsmoos.com keeps
 * control flow and data flow bound to all sixteen architectural predicates.
 */
export function x64ConditionTaken(condition, flags) {
	if (condition === "jo") return Boolean(flags.overflow);
	if (condition === "jno") return !flags.overflow;
	if (condition === "jz") return Boolean(flags.zero);
	if (condition === "jnz") return !flags.zero;
	if (condition === "js") return Boolean(flags.negative);
	if (condition === "jns") return !flags.negative;
	if (condition === "jp") return Boolean(flags.parity);
	if (condition === "jnp") return !flags.parity;
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
	return SIMPLE_CONDITIONS.has(condition)
		|| SIGNED_CONDITIONS.has(condition)
		|| UNSIGNED_CONDITIONS.has(condition);
}
