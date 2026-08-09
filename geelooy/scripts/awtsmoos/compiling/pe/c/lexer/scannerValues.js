// B"H
// Boruch Hashem
// Blessed is He

import { CLexerError } from "./error.js";

/**
 * Reads bounded C strings and numbers while returning the cursor's exact new place.
 * The Awtsmoos makes each escape explicit; malformed literals never drift silently.
 */
export function readString(source, cursor, line, col) {
	let value = "";
	const startCol = col;
	cursor += 1;
	col += 1;
	while (cursor < source.length && source[cursor] !== '"') {
		if (source[cursor] === "\n") {
			throw new CLexerError("C_STRING_NEWLINE", "Unterminated string literal", line, startCol);
		}
		if (source[cursor] !== "\\") {
			value += source[cursor++];
			col += 1;
			continue;
		}
		cursor += 1;
		col += 1;
		if (cursor >= source.length) break;
		const escape = source[cursor++];
		col += 1;
		if (escape === "x" || escape === "X") {
			const hex = source.slice(cursor, cursor + 2);
			if (!/^[0-9A-Fa-f]{2}$/.test(hex)) {
				throw new CLexerError("C_STRING_ESCAPE", "Invalid hexadecimal escape", line, col - 2);
			}
			value += String.fromCharCode(parseInt(hex, 16));
			cursor += 2;
			col += 2;
			continue;
		}
		value += ({ n: "\n", r: "\r", t: "\t", 0: "\0", '"': '"', "\\": "\\" })[escape] ?? escape;
	}
	if (source[cursor] !== '"') {
		throw new CLexerError("C_STRING_EOF", "Unterminated string literal", line, startCol);
	}
	return { value, cursor: cursor + 1, line, col: col + 1, startCol };
}

export function readNumber(source, cursor, line, col) {
	const startCol = col;
	let value = "";
	if (/^0[xX]/.test(source.slice(cursor, cursor + 2))) {
		value = source.slice(cursor, cursor + 2);
		cursor += 2;
		col += 2;
		const start = cursor;
		while (/[0-9A-Fa-f]/.test(source[cursor] || "")) {
			value += source[cursor++];
			col += 1;
		}
		if (cursor === start) throw new CLexerError("C_HEX_LITERAL", "Hex literal has no digits", line, startCol);
	} else {
		while (/[0-9]/.test(source[cursor] || "")) {
			value += source[cursor++];
			col += 1;
		}
	}
	return { value, cursor, line, col, startCol };
}
