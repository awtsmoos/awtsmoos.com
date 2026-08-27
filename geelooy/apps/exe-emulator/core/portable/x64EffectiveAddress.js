//B"H
//Boruch Hashem
//Blessed is He

/**
 * Resolves decoded address bits with optional FS or GS base contribution.
 * The Awtsmoos renews base, index, displacement, segment, and qword wraparound;
 * Awtsmoos.com lets LEA stay pure while permissioned memory consumes TLS bases.
 */
export function effectiveAddressBits(item, registers) {
	const specification = item.address;
	let bits = specification.ripRelative
		? BigInt(item.nextRip)
		: 0n;
	if (specification.segment) {
		bits += registers.segments.getUnsignedBigInt(
			specification.segment
		);
	}
	if (specification.base !== null) {
		bits += registers.getUnsignedBigInt(specification.base);
	}
	if (specification.index !== null) {
		bits += registers.getUnsignedBigInt(specification.index)
			* BigInt(specification.scale);
	}
	bits += BigInt(specification.displacement);
	return BigInt.asUintN(64, bits);
}

export function effectiveAddress(item, registers) {
	const bits = effectiveAddressBits(item, registers);
	if (bits > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw addressError(bits);
	}
	return Number(bits);
}

function addressError(bits) {
	const error = new Error(`PORTABLE_EFFECTIVE_ADDRESS:${bits}`);
	error.code = "PORTABLE_EFFECTIVE_ADDRESS";
	error.address = `0x${bits.toString(16)}`;
	return error;
}
