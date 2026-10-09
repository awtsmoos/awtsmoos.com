// B"H
// Boruch Hashem
// Blessed is He

import { CLexerError } from "./error.js";

/**
 * Reads a C character literal and returns its code point as a decimal integer
 * token value, mirroring how C treats character constants as ints. The Awtsmoos
 * keeps the decoded value explicit; malformed literals fail closed.
 */
export function readCharacter(source, cursor, line, col) {
	const startCol = col;
	const startCursor = cursor;
	cursor += 1;
	col += 1;
	let codePoint = null;
	if (source[cursor] === "\\") {
		cursor += 1;
		col += 1;
		if (cursor >= source.length) {
			throw new CLexerError("C_CHARACTER_EOF", "Unterminated character literal", line, startCol);
		}
		const escape = source[cursor++];
		col += 1;
		if (escape === "x" || escape === "X") {
			const hex = source.slice(cursor).match(/^[0-9A-Fa-f]+/);
			if (!hex) {
				throw new CLexerError("C_CHARACTER_ESCAPE", "Invalid hexadecimal escape in character literal", line, col - 2);
			}
			codePoint = parseInt(hex[0], 16);
			cursor += hex[0].length;
			col += hex[0].length;
		} else if (/[0-7]/.test(escape)) {
			let octal = escape;
			for (let k = 0; k < 2 && /[0-7]/.test(source[cursor] || ""); k++) {
				octal += source[cursor++];
				col += 1;
			}
			codePoint = parseInt(octal, 8);
		} else {
			codePoint = ({ n: 10, r: 13, t: 9, a: 7, b: 8, f: 12, v: 11, "'": 39, '"': 34, "\\": 92 })[escape] ?? escape.codePointAt(0);
		}
	} else {
		if (cursor >= source.length || source[cursor] === "\n") {
			throw new CLexerError("C_CHARACTER_EOF", "Unterminated character literal", line, startCol);
		}
		codePoint = source.codePointAt(cursor);
		cursor += codePoint > 0xFFFF ? 2 : 1;
		col += 1;
	}
	if (source[cursor] !== "'") {
		throw new CLexerError("C_CHARACTER_WIDTH", "Character literal must contain one code point", line, startCol);
	}
	const endCursor = cursor + 1;
	return { value: String(codePoint), raw: source.slice(startCursor, endCursor), cursor: endCursor, line, col: col + 1, startCol };
}
