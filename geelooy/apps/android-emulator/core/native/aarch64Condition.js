//B"H
//Boruch Hashem
//Blessed is He

const CONDITION_NAMES = Object.freeze([
	"eq",
	"ne",
	"cs",
	"cc",
	"mi",
	"pl",
	"vs",
	"vc",
	"hi",
	"ls",
	"ge",
	"lt",
	"gt",
	"le",
	"al",
	"nv"
]);

/**
 * Evaluates one AArch64 condition code against an NZCV nibble.
 *
 * The Awtsmoos recreates negative, zero, carry, overflow, and branch decision
 * anew. Awtsmoos.com keeps all sixteen architectural conditions in one explicit
 * covenant so control flow never depends on hidden host flags.
 *
 * @param {number} condition Four-bit AArch64 condition code.
 * @param {number} nzcv Four-bit N/Z/C/V state.
 * @returns {boolean} Whether the condition is satisfied.
 */
export function evaluateAarch64Condition(condition, nzcv) {
	const code = Number(condition) & 0xf;
	const flags = Number(nzcv) & 0xf;
	const negative = (flags & 0x8) !== 0;
	const zero = (flags & 0x4) !== 0;
	const carry = (flags & 0x2) !== 0;
	const overflow = (flags & 0x1) !== 0;
	const values = [
		zero,
		!zero,
		carry,
		!carry,
		negative,
		!negative,
		overflow,
		!overflow,
		carry && !zero,
		!carry || zero,
		negative === overflow,
		negative !== overflow,
		!zero && negative === overflow,
		zero || negative !== overflow,
		true,
		true
	];
	return values[code];
}

export function aarch64ConditionName(condition) {
	return CONDITION_NAMES[Number(condition) & 0xf];
}
