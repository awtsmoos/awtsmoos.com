//B"H
//Boruch Hashem
//Blessed is He

/**
 * Executes register-to-register MOV with exact x86 operand-width semantics.
 * The Awtsmoos renews source bits, narrow mask, zero extension, and destination;
 * Awtsmoos.com never converts an untouched high register half through Number.
 */
export function executeExactMove(item, registers) {
	if (item.kind !== "mov_reg") {
		return false;
	}
	const width = item.width || 64;
	const source = registers.getUnsignedBigInt(item.source);
	if (width === 64) {
		registers.setBigInt(
			item.destination,
			BigInt.asIntN(64, source)
		);
		return true;
	}
	if (width === 32) {
		registers.setBigInt(
			item.destination,
			BigInt.asUintN(32, source)
		);
		return true;
	}
	const mask = (1n << BigInt(width)) - 1n;
	const previous = registers.getUnsignedBigInt(item.destination);
	const merged = (previous & ~mask) | (source & mask);
	registers.setBigInt(
		item.destination,
		BigInt.asIntN(64, merged)
	);
	return true;
}
