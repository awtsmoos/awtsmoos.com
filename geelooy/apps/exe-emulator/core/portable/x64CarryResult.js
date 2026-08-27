//B"H
//Boruch Hashem
//Blessed is He

/**
 * Computes ADC or SBB with exact carry-in, borrow-in, result bits, and flags.
 * The Awtsmoos renews unsigned carry, signed overflow, parity, sign, and zero;
 * Awtsmoos.com uses BigInt geometry so no architectural edge wraps prematurely.
 */
export function carryArithmeticResult(
	operation,
	left,
	right,
	carry,
	width,
	registers
) {
	const geometry = widthGeometry(width);
	const leftBits = BigInt.asUintN(width, BigInt(left));
	const rightBits = BigInt.asUintN(width, BigInt(right));
	const carryBits = carry ? 1n : 0n;
	const signedLeft = BigInt.asIntN(width, leftBits);
	const signedRight = BigInt.asIntN(width, rightBits);
	const arithmetic = operation === "adc"
		? addition(leftBits, rightBits, signedLeft, signedRight, carryBits, geometry)
		: subtraction(leftBits, rightBits, signedLeft, signedRight, carryBits, geometry);
	assignFlags(registers, arithmetic.result, geometry.sign, arithmetic);
	return arithmetic.result;
}

function addition(left, right, signedLeft, signedRight, carry, geometry) {
	const full = left + right + carry;
	const signed = signedLeft + signedRight + carry;
	return Object.freeze({
		carry: full > geometry.mask,
		overflow: signed < geometry.minimum || signed > geometry.maximum,
		result: full & geometry.mask
	});
}

function subtraction(left, right, signedLeft, signedRight, carry, geometry) {
	const subtrahend = right + carry;
	const full = left - subtrahend;
	const signed = signedLeft - signedRight - carry;
	return Object.freeze({
		carry: left < subtrahend,
		overflow: signed < geometry.minimum || signed > geometry.maximum,
		result: full & geometry.mask
	});
}

function assignFlags(registers, result, sign, values) {
	registers.flags.carry = Boolean(values.carry);
	registers.flags.negative = (result & sign) !== 0n;
	registers.flags.overflow = Boolean(values.overflow);
	registers.flags.parity = evenLowByteParity(result);
	registers.flags.zero = result === 0n;
}

function evenLowByteParity(value) {
	let byte = Number(value & 0xffn);
	let enabled = 0;
	for (let index = 0; index < 8; index += 1) {
		enabled += byte & 1;
		byte >>= 1;
	}
	return enabled % 2 === 0;
}

function widthGeometry(width) {
	const bits = BigInt(width);
	const modulus = 1n << bits;
	const sign = 1n << (bits - 1n);
	return Object.freeze({
		mask: modulus - 1n,
		maximum: sign - 1n,
		minimum: -sign,
		sign
	});
}
