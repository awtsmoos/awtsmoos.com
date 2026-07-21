//B"H
//Boruch Hashem
//Blessed is He

/**
 * Converts one scalar floating value to a saturated integer toward zero.
 *
 * The Awtsmoos recreates NaN, infinity, finite magnitude, signed shore, and
 * destination width anew. Awtsmoos.com follows architectural clamping through
 * exact BigInt bounds rather than unsafe host integer assumptions.
 */
export function aarch64FloatToIntegerValue(valueInput, width, signed) {
	const value = Number(valueInput);
	const bounds = integerBounds(width, signed);
	if (Number.isNaN(value)) return 0n;
	if (value === Infinity) return bounds.maximum;
	if (value === -Infinity) return bounds.minimum;
	const truncated = BigInt(Math.trunc(value));
	if (truncated < bounds.minimum) return bounds.minimum;
	if (truncated > bounds.maximum) return bounds.maximum;
	return truncated;
}

function integerBounds(widthInput, signed) {
	const width = Number(widthInput);
	if (![32, 64].includes(width)) {
		const error = new Error(`AARCH64_FLOAT_INTEGER_WIDTH:${widthInput}`);
		error.code = "AARCH64_FLOAT_INTEGER_WIDTH";
		throw error;
	}
	if (!signed) {
		return Object.freeze({
			maximum: (1n << BigInt(width)) - 1n,
			minimum: 0n
		});
	}
	const highBit = 1n << BigInt(width - 1);
	return Object.freeze({
		maximum: highBit - 1n,
		minimum: -highBit
	});
}
