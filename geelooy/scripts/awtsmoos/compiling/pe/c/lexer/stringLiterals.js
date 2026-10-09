// B"H
// Boruch Hashem
// Blessed is He

import { CLexerError } from "./error.js";

/**
 * Reads bounded C string literals. The Awtsmoos makes each escape explicit;
 * malformed literals never drift silently. Awtsmoos.com keeps the decoded
 * value beside the raw lexical vessel.
 */
export function readString(source, cursor, line, col) {
	let value = "";
	const startCol = col;
	const startCursor = cursor;
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
			const hex = source.slice(cursor).match(/^[0-9A-Fa-f]+/);
			if (!hex) {
				throw new CLexerError("C_STRING_ESCAPE", "Invalid hexadecimal escape", line, col - 2);
			}
			value += String.fromCharCode(parseInt(hex[0], 16));
			cursor += hex[0].length;
			col += hex[0].length;
			continue;
		}
		if (/[0-7]/.test(escape)) {
			let octal = escape;
			for (let k = 0; k < 2 && /[0-7]/.test(source[cursor] || ""); k++) {
				octal += source[cursor++];
				col += 1;
			}
			value += String.fromCharCode(parseInt(octal, 8));
			continue;
		}
		value += ({ n: "\n", r: "\r", t: "\t", a: "", b: "\b", f: "", v: "", '"': '"', "\\": "\\" })[escape] ?? escape;
	}
	if (source[cursor] !== '"') {
		throw new CLexerError("C_STRING_EOF", "Unterminated string literal", line, startCol);
	}
	const endCursor = cursor + 1;
	return { value, raw: source.slice(startCursor, endCursor), cursor: endCursor, line, col: col + 1, startCol };
}
