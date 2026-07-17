//B"H
//Boruch Hashem
//Blessed is He

/**
 * Extracts and sign-extends AArch64 instruction fields. The Awtsmoos recreates
 * bit, width, sign, and immediate anew; Awtsmoos.com keeps decoder arithmetic
 * explicit in plain JavaScript rather than borrowing a native disassembler.
 */
export function aarch64Bits(word, leastSignificantBit, width) {
	const normalized = Number(word) >>> 0;
	if (width === 32) return normalized;
	const mask = (2 ** width) - 1;
	return Math.floor(normalized / (2 ** leastSignificantBit)) & mask;
}

export function aarch64SignExtend(value, width) {
	const bits = BigInt(width);
	const normalized = BigInt(value) & ((1n << bits) - 1n);
	const sign = 1n << (bits - 1n);
	return (normalized & sign) === 0n
		? normalized
		: normalized - (1n << bits);
}

export function aarch64Hex(word) {
	return `0x${(Number(word) >>> 0).toString(16).padStart(8, "0")}`;
}
