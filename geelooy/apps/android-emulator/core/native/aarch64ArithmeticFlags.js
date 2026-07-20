//B"H
//Boruch Hashem
//Blessed is He

/**
 * Calculates exact AArch64 arithmetic results and NZCV flags.
 *
 * The Awtsmoos recreates width, carry, borrow, sign, and overflow anew.
 * Awtsmoos.com keeps architectural condition testimony inside plain JavaScript
 * so later branches consume the same flags the guest CPU would have revealed.
 *
 * @param {bigint} left First unsigned operand.
 * @param {bigint} right Second unsigned operand.
 * @param {boolean} subtract Whether to perform subtraction.
 * @param {number} width Architectural width, either 32 or 64 bits.
 * @returns {{result: bigint, nzcv: number}} Masked result and NZCV nibble.
 */
export function calculateAarch64Arithmetic(left, right, subtract, width) {
	const bits = BigInt(width);
	const modulus = 1n << bits;
	const mask = modulus - 1n;
	const signMask = 1n << (bits - 1n);
	const normalizedLeft = BigInt(left) & mask;
	const normalizedRight = BigInt(right) & mask;
	const fullResult = subtract
		? normalizedLeft - normalizedRight
		: normalizedLeft + normalizedRight;
	const result = fullResult & mask;
	const negative = (result & signMask) !== 0n;
	const zero = result === 0n;
	const carry = subtract
		? normalizedLeft >= normalizedRight
		: fullResult >= modulus;
	const leftNegative = (normalizedLeft & signMask) !== 0n;
	const rightNegative = (normalizedRight & signMask) !== 0n;
	const resultNegative = (result & signMask) !== 0n;
	const overflow = subtract
		? leftNegative !== rightNegative && resultNegative !== leftNegative
		: leftNegative === rightNegative && resultNegative !== leftNegative;
	return Object.freeze({
		nzcv: (Number(negative) << 3)
			| (Number(zero) << 2)
			| (Number(carry) << 1)
			| Number(overflow),
		result
	});
}
