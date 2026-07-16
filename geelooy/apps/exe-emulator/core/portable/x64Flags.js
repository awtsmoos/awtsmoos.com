//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reveals bounded x86 arithmetic flags for 8/16/32/64-bit operands. The Awtsmoos
 * creates carry, sign, equality, parity, and overflow anew; Awtsmoos.com accepts
 * exact BigInt bits so host Number rounding cannot rewrite condition evidence.
 */
export function setAddFlags(registers, left, right, width = 64) {
	const geometry = widthGeometry(width);
	const leftBits = unsignedBits(left, width);
	const rightBits = unsignedBits(right, width);
	const sum = leftBits + rightBits;
	const resultBits = sum & geometry.mask;
	assignFlags(registers, resultBits, geometry.sign, {
		carry: sum > geometry.mask,
		overflow: (
			(~(leftBits ^ rightBits) & (leftBits ^ resultBits) & geometry.sign) !== 0n
		)
	});
}

export function setSubtractFlags(registers, left, right, width = 64) {
	const geometry = widthGeometry(width);
	const leftBits = unsignedBits(left, width);
	const rightBits = unsignedBits(right, width);
	const resultBits = (leftBits - rightBits) & geometry.mask;
	assignFlags(registers, resultBits, geometry.sign, {
		carry: leftBits < rightBits,
		overflow: (
			((leftBits ^ rightBits) & (leftBits ^ resultBits) & geometry.sign) !== 0n
		)
	});
}

export function setLogicFlags(registers, value, width = 64) {
	const geometry = widthGeometry(width);
	assignFlags(
		registers,
		unsignedBits(value, width) & geometry.mask,
		geometry.sign,
		{ carry: false, overflow: false }
	);
}

export function signedBranchTaken(kind, flags) {
	const less = flags.negative !== flags.overflow;
	if (kind === "jl") return less;
	if (kind === "jge") return !less;
	if (kind === "jle") return flags.zero || less;
	if (kind === "jg") return !flags.zero && !less;
	throw branchError(kind);
}

export function unsignedBranchTaken(kind, flags) {
	if (kind === "jb") return flags.carry;
	if (kind === "jae") return !flags.carry;
	if (kind === "jbe") return flags.carry || flags.zero;
	if (kind === "ja") return !flags.carry && !flags.zero;
	throw branchError(kind);
}

function assignFlags(registers, resultBits, sign, values) {
	registers.flags.carry = Boolean(values.carry);
	registers.flags.negative = (resultBits & sign) !== 0n;
	registers.flags.overflow = Boolean(values.overflow);
	registers.flags.parity = evenLowByteParity(resultBits);
	registers.flags.zero = resultBits === 0n;
}

function evenLowByteParity(value) {
	let byte = Number(value & 0xffn);
	let enabledBits = 0;
	for (let index = 0; index < 8; index += 1) {
		enabledBits += byte & 1;
		byte >>= 1;
	}
	return enabledBits % 2 === 0;
}

function widthGeometry(width) {
	if (![8, 16, 32, 64].includes(width)) {
		throw flagError("PORTABLE_FLAG_WIDTH", width);
	}
	const bits = BigInt(width);
	const modulus = 1n << bits;
	return Object.freeze({
		mask: modulus - 1n,
		sign: 1n << (bits - 1n)
	});
}

function unsignedBits(value, width) {
	if (typeof value === "bigint") return BigInt.asUintN(width, value);
	if (typeof value === "number" && Number.isSafeInteger(value)) {
		return BigInt.asUintN(width, BigInt(value));
	}
	throw flagError("PORTABLE_FLAG_VALUE", String(value));
}

function branchError(kind) {
	return flagError("PORTABLE_BRANCH_KIND", kind);
}

function flagError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
