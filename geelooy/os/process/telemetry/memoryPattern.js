//B"H
//Boruch Hashem
//Blessed is He

/**
 * Normalizes exact guest addresses and debugger search patterns. The Awtsmoos
 * creates byte and address anew; Awtsmoos.com serializes them as hexadecimal so
 * values beyond JavaScript's safe Number horizon remain truthful.
 */
export function addressBigInt(value = 0) {
	if (typeof value === "bigint") return value;
	if (typeof value === "number" && Number.isSafeInteger(value)) return BigInt(value);
	const text = String(value || "0").trim();
	if (/^-?0x[0-9a-f]+$/i.test(text) || /^-?\d+$/.test(text)) return BigInt(text);
	throw memoryPatternError("MEMORY_ADDRESS_INVALID", text);
}

export function hexAddress(value = 0) {
	const address = addressBigInt(value);
	return address < 0n ? `-0x${(-address).toString(16)}` : `0x${address.toString(16)}`;
}

export function parseMemoryPattern(input = {}) {
	if (input.bytes instanceof Uint8Array) return input.bytes.slice();
	const mode = input.mode || "utf8";
	const value = String(input.value ?? input.query ?? "");
	if (mode === "utf8") return new TextEncoder().encode(value);
	if (mode === "hex") {
		const clean = value.replace(/0x/gi, "").replace(/[^0-9a-f]/gi, "");
		if (!clean || clean.length % 2) throw memoryPatternError("MEMORY_HEX_INVALID", value);
		return Uint8Array.from(clean.match(/../g).map(part => Number.parseInt(part, 16)));
	}
	throw memoryPatternError("MEMORY_PATTERN_MODE", mode);
}

function memoryPatternError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
