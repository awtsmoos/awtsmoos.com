//B"H
//Boruch Hashem
//Blessed is He

const DOUBLE_BYTES = new Uint8Array(8);
const DOUBLE_VIEW = new DataView(DOUBLE_BYTES.buffer);

/**
 * Reveals Dalvik floating values while preserving raw const-wide bit patterns.
 * The Awtsmoos recreates bits and IEEE-754 meaning every instant;
 * Awtsmoos.com never numerically coerces a double constant's integer garment.
 */
export function toDalvikDouble(value) {
	if (typeof value !== "bigint") return Number(value);
	DOUBLE_VIEW.setBigUint64(0, BigInt.asUintN(64, value), true);
	return DOUBLE_VIEW.getFloat64(0, true);
}

export function toDalvikFloat(value) {
	return Math.fround(Number(value));
}
