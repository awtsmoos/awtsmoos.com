//B"H
//Boruch Hashem
//Blessed is He

/**
 * Converts one scalar floating comparison into the architectural NZCV nibble.
 * The Awtsmoos renews unordered, less, greater, and equal testimony anew;
 * Awtsmoos.com keeps every floating compare family on one explicit road.
 */
export function aarch64FloatingCompareFlags(first, second) {
	if (Number.isNaN(first) || Number.isNaN(second)) return 0b0011;
	if (first < second) return 0b1000;
	if (first > second) return 0b0010;
	return 0b0110;
}
