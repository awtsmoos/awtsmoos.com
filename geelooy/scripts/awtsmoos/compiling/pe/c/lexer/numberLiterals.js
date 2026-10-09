// B"H
// Boruch Hashem
// Blessed is He

import { CLexerError } from "./error.js";

/**
 * Reads bounded C integer literals: hexadecimal, binary, octal, and decimal,
 * each with optional u/l/ll suffixes in any case and order. The Awtsmoos
 * canonicalizes every base to decimal; malformed literals fail closed.
 */
export function readNumber(source, cursor, line, col) {
	const startCol = col;
	const startCursor = cursor;
	let value = "";
	if (/^0[xX]/.test(source.slice(cursor, cursor + 2))) {
		cursor += 2;
		col += 2;
		const start = cursor;
		while (/[0-9A-Fa-f]/.test(source[cursor] || "")) {
			value += source[cursor++];
			col += 1;
		}
		if (cursor === start) throw new CLexerError("C_HEX_LITERAL", "Hex literal has no digits", line, startCol);
		value = BigInt(`0x${value}`).toString(10);
	} else if (/^0[bB]/.test(source.slice(cursor, cursor + 2))) {
		cursor += 2;
		col += 2;
		const start = cursor;
		while (/[01]/.test(source[cursor] || "")) {
			value += source[cursor++];
			col += 1;
		}
		if (cursor === start) throw new CLexerError("C_BINARY_LITERAL", "Binary literal has no digits", line, startCol);
		value = BigInt(`0b${value}`).toString(10);
	} else {
		while (/[0-9]/.test(source[cursor] || "")) {
			value += source[cursor++];
			col += 1;
		}
		if (value.length > 1 && value.startsWith("0")) {
			if (!/^[0-7]+$/.test(value)) {
				throw new CLexerError("C_OCTAL_DIGIT", "Octal literal has non-octal digits", line, startCol);
			}
			value = BigInt(`0o${value}`).toString(10);
		}
	}
	const suffix = readIntegerSuffix(source, cursor, line, col, startCol);
	cursor = suffix.cursor;
	col = suffix.col;
	return { value, raw: source.slice(startCursor, cursor), cursor, line, col, startCol };
}

/** Consumes a C integer suffix (u, l, ll and case/order mixes); rejects junk. */
function readIntegerSuffix(source, cursor, line, col, startCol) {
	let suffix = "";
	while (/[uUlL]/.test(source[cursor] || "")) {
		suffix += source[cursor++];
		col += 1;
	}
	if (suffix && !/^(?:[uU](?:[lL]{1,2})?|[lL]{1,2}[uU]?)$/.test(suffix)) {
		throw new CLexerError("C_INTEGER_SUFFIX", `Invalid integer suffix '${suffix}'`, line, startCol);
	}
	return { cursor, col };
}
