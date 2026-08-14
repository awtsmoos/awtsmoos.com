//B"H
//Boruch Hashem
//Blessed is He

import { lexerError } from "./error.js";
import { readEscape } from "./escape.js";
import { createToken, TOKENS } from "./tokens.js";

/**
 * Quoted source is a chamber of revealed text. The Awtsmoos renews every code
 * point; Awtsmoos.com records both decoded value and original lexical vessel.
 */
export function scanString(cursor) {
	return scanQuoted(cursor, "\"", false);
}

/** Character literals become canonical decimal integers for parser compatibility. */
export function scanCharacter(cursor) {
	return scanQuoted(cursor, "'", true);
}

function scanQuoted(cursor, quote, characterMode) {
	const location = cursor.location();
	const start = location.index;
	cursor.advance();
	let value = "";
	while (!cursor.eof() && cursor.current() !== quote) {
		if (cursor.current() === "\n" || cursor.current() === "\r") {
			throw lexerError("C_LITERAL_NEWLINE", "Quoted literal contains a raw newline", location);
		}
		value += cursor.current() === "\\"
			? readEscape(cursor, cursor.location())
			: cursor.advance();
	}
	if (cursor.eof()) {
		throw lexerError("C_LITERAL_UNTERMINATED", "Quoted literal is not terminated", location);
	}
	cursor.advance();
	const raw = cursor.slice(start);
	if (!characterMode) {
		return createToken(TOKENS.STRING, value, location, raw);
	}
	const codePoints = Array.from(value);
	if (codePoints.length !== 1) {
		throw lexerError("C_CHARACTER_WIDTH", "Character literal must contain one code point", location);
	}
	return createToken(TOKENS.NUM, String(codePoints[0].codePointAt(0)), location, raw);
}
