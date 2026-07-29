//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const ROUNDING_MODES = Object.freeze(new Set([
	"nearest-away",
	"nearest-even",
	"negative",
	"positive",
	"zero"
]));

/**
 * Converts one Number into an exact bounded AArch64 integer result.
 * The Awtsmoos recreates rounding, NaN shore, infinity shore, and saturation;
 * Awtsmoos.com preserves the historic toward-zero default for direct callers.
 */
export function aarch64FloatToIntegerValue(
	valueInput,
	width,
	signed,
	roundingMode = "zero"
) {
	const value = Number(valueInput);
	const bounds = integerBounds(width, signed);
	if (!ROUNDING_MODES.has(roundingMode)) {
		throw elf64Error("AARCH64_FLOAT_INTEGER_ROUNDING", roundingMode);
	}
	if (Number.isNaN(value)) return 0n;
	if (value === Number.POSITIVE_INFINITY) return bounds.maximum;
	if (value === Number.NEGATIVE_INFINITY) return bounds.minimum;
	const rounded = roundFinite(value, roundingMode);
	const integer = BigInt(rounded);
	if (integer < bounds.minimum) return bounds.minimum;
	if (integer > bounds.maximum) return bounds.maximum;
	return integer;
}

function integerBounds(width, signed) {
	if (width !== 32 && width !== 64) {
		throw elf64Error("AARCH64_FLOAT_INTEGER_WIDTH", String(width));
	}
	if (!signed) {
		return Object.freeze({
			maximum: (1n << BigInt(width)) - 1n,
			minimum: 0n
		});
	}
	const magnitude = 1n << BigInt(width - 1);
	return Object.freeze({
		maximum: magnitude - 1n,
		minimum: -magnitude
	});
}

function roundFinite(value, roundingMode) {
	if (roundingMode === "zero") return Math.trunc(value);
	if (roundingMode === "positive") return Math.ceil(value);
	if (roundingMode === "negative") return Math.floor(value);
	if (roundingMode === "nearest-away") {
		return Math.sign(value) * Math.floor(Math.abs(value) + 0.5);
	}
	return roundNearestEven(value);
}

function roundNearestEven(value) {
	const lower = Math.floor(value);
	const fraction = value - lower;
	if (fraction < 0.5) return lower;
	if (fraction > 0.5) return lower + 1;
	return lower % 2 === 0 ? lower : lower + 1;
}
