//B"H
//Boruch Hashem
//Blessed is He

/**
 * Decodes and accesses x86-64 byte-register encodings. The Awtsmoos creates AL,
 * AH, SPL, R8B, and preserved surrounding bits anew; Awtsmoos.com extracts and
 * replaces only eight exact bits without narrowing the containing register.
 */
export function decodeByteRegister(code, rexExtension, rexPresent) {
	const normalized = Number(code) & 7;
	if (!rexPresent && normalized >= 4) {
		return Object.freeze({
			high: true,
			register: normalized - 4
		});
	}
	return Object.freeze({
		high: false,
		register: normalized + (rexExtension ? 8 : 0)
	});
}

export function readByteRegister(registers, specification) {
	const bits = registers.getUnsignedBigInt(specification.register);
	const shift = specification.high ? 8n : 0n;
	return Number((bits >> shift) & 0xffn);
}

export function writeByteRegister(registers, specification, value) {
	const original = registers.getUnsignedBigInt(specification.register);
	const shift = specification.high ? 8n : 0n;
	const mask = 0xffn << shift;
	const replacement = (original & ~mask)
		| (byteBits(value) << shift);
	registers.setBigInt(
		specification.register,
		BigInt.asIntN(64, replacement)
	);
}

function byteBits(value) {
	if (typeof value === "bigint") return BigInt.asUintN(8, value);
	if (typeof value === "number" && Number.isSafeInteger(value)) {
		return BigInt.asUintN(8, BigInt(value));
	}
	const error = new Error(`PORTABLE_BYTE_REGISTER_VALUE:${value}`);
	error.code = "PORTABLE_BYTE_REGISTER_VALUE";
	throw error;
}
