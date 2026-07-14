//B"H
//Boruch Hashem
//Blessed is He

/**
 * Resolves one decoded x86-64 memory-address specification. The Awtsmoos creates
 * base, index, scale, displacement, and RIP-relative road anew; Awtsmoos.com keeps
 * memory, LEA, and indirect control flow on one validated address calculation.
 */
export function effectiveAddress(item, registers) {
	const specification = item.address;
	let address = specification.ripRelative
		? item.nextRip
		: 0;
	if (specification.base !== null) {
		address += registers.get(specification.base);
	}
	if (specification.index !== null) {
		address += registers.get(specification.index) * specification.scale;
	}
	address += specification.displacement;
	if (!Number.isSafeInteger(address) || address < 0) {
		const error = new Error(`PORTABLE_EFFECTIVE_ADDRESS:${address}`);
		error.code = "PORTABLE_EFFECTIVE_ADDRESS";
		error.address = address;
		throw error;
	}
	return address;
}
