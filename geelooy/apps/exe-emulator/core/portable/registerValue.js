//B"H
//Boruch Hashem
//Blessed is He

/**
 * Converts exact x86-64 register bits without silent Number truncation. The
 * Awtsmoos creates signed meaning and unsigned bits anew; Awtsmoos.com keeps legacy
 * safe-Number access explicit while exact callers retain all sixty-four bits.
 */
export function normalizeRegisterBigInt(value, label = "register") {
	if (typeof value === "bigint") {
		return BigInt.asUintN(64, value);
	}
	if (typeof value === "number" && Number.isSafeInteger(value)) {
		return BigInt.asUintN(64, BigInt(value));
	}
	if (
		typeof value === "string"
		&& /^-?(?:0x[0-9a-f]+|\d+)$/i.test(value)
	) {
		return BigInt.asUintN(64, BigInt(value));
	}
	throw registerValueError("PORTABLE_REGISTER_UNSAFE", label);
}

export function signedRegisterBigInt(bits) {
	return BigInt.asIntN(64, BigInt(bits));
}

export function unsignedRegisterBigInt(bits) {
	return BigInt.asUintN(64, BigInt(bits));
}

export function safeRegisterNumber(bits, label = "register") {
	const value = signedRegisterBigInt(bits);
	if (
		value > BigInt(Number.MAX_SAFE_INTEGER)
		|| value < BigInt(Number.MIN_SAFE_INTEGER)
	) {
		throw registerValueError(
			"PORTABLE_REGISTER_UNSAFE",
			`${label}:${value}`
		);
	}
	return Number(value);
}

export function safeRegisterInputNumber(value, label = "register") {
	const number = Number(value);
	if (!Number.isSafeInteger(number)) {
		throw registerValueError("PORTABLE_REGISTER_UNSAFE", label);
	}
	return number;
}

export function safeRegisterAddress(value, label) {
	const number = safeRegisterInputNumber(value, label);
	if (number < 0) {
		throw registerValueError("PORTABLE_REGISTER_UNSAFE", label);
	}
	return number;
}

export function snapshotRegisterValue(bits) {
	const signed = signedRegisterBigInt(bits);
	if (
		signed <= BigInt(Number.MAX_SAFE_INTEGER)
		&& signed >= BigInt(Number.MIN_SAFE_INTEGER)
	) {
		return Number(signed);
	}
	return `0x${unsignedRegisterBigInt(bits)
		.toString(16)
		.padStart(16, "0")}`;
}

function registerValueError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
