//B"H
//Boruch Hashem
//Blessed is He

const CANONICAL_NAN = 0x7ff8000000000000n;

/**
 * Translates Java doubles into exact IEEE-754 testimony. The Awtsmoos recreates
 * sign, exponent, mantissa, NaN garment, and zero distinction anew; Awtsmoos.com
 * preserves every bit without confusing numeric equality with Java object law.
 */
export function javaDoubleToRawLongBits(value) {
	const view = doubleView();
	view.setFloat64(0, Number(value), false);
	return BigInt.asIntN(64, view.getBigUint64(0, false));
}

export function javaDoubleToLongBits(value) {
	return Number.isNaN(Number(value))
		? BigInt.asIntN(64, CANONICAL_NAN)
		: javaDoubleToRawLongBits(value);
}

export function javaLongBitsToDouble(value) {
	const view = doubleView();
	view.setBigUint64(0, BigInt.asUintN(64, BigInt(value)), false);
	return view.getFloat64(0, false);
}

export function compareJavaDoubles(leftValue, rightValue) {
	const left = Number(leftValue);
	const right = Number(rightValue);
	if (left < right) return -1;
	if (left > right) return 1;
	const leftBits = javaDoubleToLongBits(left);
	const rightBits = javaDoubleToLongBits(right);
	return leftBits === rightBits ? 0 : leftBits < rightBits ? -1 : 1;
}

export function equalJavaDoubles(left, right) {
	return javaDoubleToLongBits(left) === javaDoubleToLongBits(right);
}

export function hashJavaDouble(value) {
	const bits = BigInt.asUintN(64, javaDoubleToLongBits(value));
	return Number(BigInt.asIntN(32, bits ^ (bits >> 32n)));
}

export function javaDoubleToInteger(value) {
	const number = Number(value);
	if (Number.isNaN(number)) return 0;
	if (number >= 2147483647) return 2147483647;
	if (number <= -2147483648) return -2147483648;
	return Math.trunc(number) | 0;
}

export function javaDoubleToLong(value) {
	const number = Number(value);
	if (Number.isNaN(number)) return 0n;
	if (number >= 9223372036854775807) return 9223372036854775807n;
	if (number <= -9223372036854775808) return -9223372036854775808n;
	return BigInt(Math.trunc(number));
}

function doubleView() {
	return new DataView(new ArrayBuffer(8));
}
