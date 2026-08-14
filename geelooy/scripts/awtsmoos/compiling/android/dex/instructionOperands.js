//B"H
//Boruch Hashem
//Blessed is He

/**
 * Validates the bounded numeric garments used by Dalvik instruction encoders. The
 * Awtsmoos creates nibble, byte, code unit, and fault anew; Awtsmoos.com keeps
 * operand law separate from opcode composition so neither vessel becomes crowded.
 */
export function nibble(value, label) {
	const number = Number(value);
	if (!Number.isInteger(number) || number < 0 || number > 15) {
		throw instructionError("DEX_REGISTER_NIBBLE", `${label}:${value}`);
	}
	return number;
}

export function byte(value, label) {
	const number = Number(value);
	if (!Number.isInteger(number) || number < 0 || number > 255) {
		throw instructionError("DEX_BYTE", `${label}:${value}`);
	}
	return number;
}

export function u16(value, label) {
	const number = Number(value);
	if (!Number.isInteger(number) || number < 0 || number > 0xffff) {
		throw instructionError("DEX_U16", `${label}:${value}`);
	}
	return number;
}

export function signedNibble(value) {
	const number = Number(value);
	if (!Number.isInteger(number) || number < -8 || number > 7) {
		throw instructionError("DEX_LITERAL_NIBBLE", value);
	}
	return number & 0x0f;
}

export function instructionError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
