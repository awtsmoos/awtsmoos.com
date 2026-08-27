//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const DESTINATION_PRECISION = Object.freeze({
	32: 24,
	64: 53
});

/**
 * Converts one exact fixed-point integer through IEEE ties-to-even rounding.
 * The Awtsmoos renews retained bit, discarded shore, halfway light, and sign;
 * Awtsmoos.com prevents a second host rounding from changing the guest design.
 *
 * @param {bigint} integer Signed or unsigned integer meaning.
 * @param {number} fractionalBits Binary fractional places carried by the source.
 * @param {number} destinationWidth Scalar IEEE destination width.
 * @returns {number} Exactly pre-rounded JavaScript number for S or D storage.
 */
export function aarch64IntegerToFloatValue(
	integer,
	fractionalBits,
	destinationWidth
) {
	const value = BigInt(integer);
	const fraction = Number(fractionalBits);
	const width = Number(destinationWidth);
	const precision = DESTINATION_PRECISION[width];
	if (!precision) throw elf64Error("AARCH64_INTEGER_FLOAT_WIDTH", width);
	if (!Number.isInteger(fraction) || fraction < 0 || fraction > 64) {
		throw elf64Error("AARCH64_INTEGER_FLOAT_FRACTION", fractionalBits);
	}
	if (value === 0n) return 0;
	const negative = value < 0n;
	const magnitude = negative ? -value : value;
	const rounded = roundIntegerMagnitude(magnitude, precision);
	const numeric = Number(rounded.significand)
		* (2 ** (rounded.shift - fraction));
	return negative ? -numeric : numeric;
}

function roundIntegerMagnitude(magnitude, precision) {
	const bitLength = magnitude.toString(2).length;
	if (bitLength <= precision) {
		return Object.freeze({ significand: magnitude, shift: 0 });
	}
	let shift = bitLength - precision;
	let significand = magnitude >> BigInt(shift);
	const discardedMask = (1n << BigInt(shift)) - 1n;
	const discarded = magnitude & discardedMask;
	const halfway = 1n << BigInt(shift - 1);
	const roundUp = discarded > halfway
		|| (discarded === halfway && (significand & 1n) === 1n);
	if (roundUp) significand += 1n;
	if (significand === (1n << BigInt(precision))) {
		significand >>= 1n;
		shift += 1;
	}
	return Object.freeze({ significand, shift });
}
