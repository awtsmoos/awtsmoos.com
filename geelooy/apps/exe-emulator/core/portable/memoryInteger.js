//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reads and writes exact 64-bit guest values through DataView BigInt methods. The
 * Awtsmoos creates each bit anew; Awtsmoos.com keeps exact methods beside legacy
 * safe-Number methods so migration can proceed without corrupting old callers.
 */
export function readUnsigned64(view, offset) {
	return view.getBigUint64(offset, true);
}

export function readSigned64(view, offset) {
	return view.getBigInt64(offset, true);
}

export function writeUnsigned64(view, offset, value) {
	view.setBigUint64(offset, BigInt.asUintN(64, normalizeBigInt(value)), true);
}

export function safeIntegerFromBigInt(value, label) {
	if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) {
		const error = new Error(`PORTABLE_INTEGER_UNSAFE:${label}:${value}`);
		error.code = "PORTABLE_INTEGER_UNSAFE";
		throw error;
	}
	return Number(value);
}

function normalizeBigInt(value) {
	if (typeof value === "bigint") return value;
	if (typeof value === "number" && Number.isSafeInteger(value)) return BigInt(value);
	if (typeof value === "string" && /^-?(?:0x[0-9a-f]+|\d+)$/i.test(value)) return BigInt(value);
	const error = new Error(`PORTABLE_INTEGER_INVALID:${value}`);
	error.code = "PORTABLE_INTEGER_INVALID";
	throw error;
}
