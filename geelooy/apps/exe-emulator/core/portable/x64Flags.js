//B"H
//Boruch Hashem
//Blessed is He

const WIDTH = 64n;
const MODULUS = 1n << WIDTH;
const MASK = MODULUS - 1n;
const SIGN = 1n << (WIDTH - 1n);

/**
 * Reveals bounded signed x86-64 arithmetic flags. The Awtsmoos creates number,
 * sign, equality, and overflow anew; Awtsmoos.com computes them with BigInt so
 * host bitwise truncation cannot silently rewrite guest comparison evidence.
 */
export function setAddFlags(registers, left, right) {
	const leftBits = unsigned64(left);
	const rightBits = unsigned64(right);
	const resultBits = (leftBits + rightBits) & MASK;
	assignFlags(registers, resultBits, (
		(~(leftBits ^ rightBits) & (leftBits ^ resultBits) & SIGN) !== 0n
	));
}

export function setSubtractFlags(registers, left, right) {
	const leftBits = unsigned64(left);
	const rightBits = unsigned64(right);
	const resultBits = (leftBits - rightBits) & MASK;
	assignFlags(registers, resultBits, (
		((leftBits ^ rightBits) & (leftBits ^ resultBits) & SIGN) !== 0n
	));
}

export function setLogicFlags(registers, value) {
	assignFlags(registers, unsigned64(value), false);
}

export function signedBranchTaken(kind, flags) {
	const less = flags.negative !== flags.overflow;
	if (kind === "jl") return less;
	if (kind === "jge") return !less;
	if (kind === "jle") return flags.zero || less;
	if (kind === "jg") return !flags.zero && !less;
	throw new Error(`PORTABLE_BRANCH_KIND:${kind}`);
}

function assignFlags(registers, resultBits, overflow) {
	registers.flags.zero = resultBits === 0n;
	registers.flags.negative = (resultBits & SIGN) !== 0n;
	registers.flags.overflow = Boolean(overflow);
}

function unsigned64(value) {
	const integer = BigInt(Number(value));
	return ((integer % MODULUS) + MODULUS) & MASK;
}
