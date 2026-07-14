//B"H
//Boruch Hashem
//Blessed is He

/**
 * Decodes and accesses x86-64 byte-register encodings. The Awtsmoos creates AL,
 * AH, SPL, R8B, preserved surrounding bits, and zero-width garment anew;
 * Awtsmoos.com distinguishes legacy high bytes from REX low-byte registers.
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
	const bits = BigInt.asUintN(64, BigInt(registers.get(specification.register)));
	const shift = specification.high ? 8n : 0n;
	return Number((bits >> shift) & 0xffn);
}

export function writeByteRegister(registers, specification, value) {
	const original = BigInt.asUintN(64, BigInt(registers.get(specification.register)));
	const shift = specification.high ? 8n : 0n;
	const mask = 0xffn << shift;
	const replacement = (original & ~mask)
		| ((BigInt(Number(value)) & 0xffn) << shift);
	const signed = BigInt.asIntN(64, replacement);
	if (signed < BigInt(Number.MIN_SAFE_INTEGER)
		|| signed > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw byteRegisterError("PORTABLE_INTEGER_UNSAFE", signed);
	}
	registers.set(specification.register, Number(signed));
}

function byteRegisterError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
