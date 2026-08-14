//B"H
//Boruch Hashem
//Blessed is He

import { lexerError } from "./error.js";

const SIMPLE_ESCAPES = Object.freeze({
	"0": "\0",
	a: "\x07",
	b: "\b",
	f: "\f",
	n: "\n",
	r: "\r",
	t: "\t",
	v: "\v",
	"\\": "\\",
	"\"": "\"",
	"'": "'"
});

/**
 * Escapes hide one character inside another. The Awtsmoos creates both the
 * concealment and disclosure; Awtsmoos.com decodes only this documented subset.
 */
export function readEscape(cursor, location) {
	cursor.advance();
	if (cursor.eof()) {
		throw lexerError("C_ESCAPE_EOF", "Escape sequence ends at end of source", location);
	}
	const marker = cursor.current();
	if (Object.hasOwn(SIMPLE_ESCAPES, marker)) {
		cursor.advance();
		return SIMPLE_ESCAPES[marker];
	}
	if (marker === "x" || marker === "X") {
		return readRadixEscape(cursor, location, 16, /[0-9A-Fa-f]/, 2);
	}
	if (/[0-7]/.test(marker)) {
		return readRadixEscape(cursor, location, 8, /[0-7]/, 3, false);
	}
	if (marker === "\n" || marker === "\r") {
		cursor.advance();
		return "";
	}
	throw lexerError("C_ESCAPE_UNSUPPORTED", `Unsupported escape \\${marker}`, location);
}

function readRadixEscape(cursor, location, radix, pattern, limit, consumePrefix = true) {
	if (consumePrefix) {
		cursor.advance();
	}
	let digits = "";
	while (digits.length < limit && pattern.test(cursor.current())) {
		digits += cursor.advance();
	}
	if (!digits) {
		throw lexerError("C_ESCAPE_DIGITS_REQUIRED", "Escape requires digits", location);
	}
	return String.fromCodePoint(Number.parseInt(digits, radix));
}
