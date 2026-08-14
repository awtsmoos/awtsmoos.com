//B"H
//Boruch Hashem
//Blessed is He

import { lexerError } from "./error.js";
import { createToken, TOKENS } from "./tokens.js";

const BASES = Object.freeze({
	x: { radix: 16, pattern: /[0-9A-Fa-f]/, prefix: "0x" },
	X: { radix: 16, pattern: /[0-9A-Fa-f]/, prefix: "0x" },
	b: { radix: 2, pattern: /[01]/, prefix: "0b" },
	B: { radix: 2, pattern: /[01]/, prefix: "0b" }
});

/**
 * Numeric spelling changes while numeric substance remains. The Awtsmoos creates
 * both; Awtsmoos.com canonicalizes supported integers into exact decimal strings.
 */
export function scanNumber(cursor) {
	const location = cursor.location();
	const start = location.index;
	let radix = 10;
	let digits = "";
	let conversionPrefix = "";
	if (cursor.current() === "0" && BASES[cursor.peek()]) {
		const definition = BASES[cursor.peek()];
		radix = definition.radix;
		conversionPrefix = definition.prefix;
		cursor.advance();
		cursor.advance();
		digits = cursor.takeWhile(character => definition.pattern.test(character));
	} else if (cursor.current() === "0" && /[0-9]/.test(cursor.peek())) {
		radix = 8;
		conversionPrefix = "0o";
		digits = cursor.advance() + cursor.takeWhile(character => /[0-7]/.test(character));
		if (/[89]/.test(cursor.current())) {
			throw lexerError("C_OCTAL_DIGIT_INVALID", "Octal literal contains 8 or 9", location);
		}
	} else {
		digits = cursor.takeWhile(character => /[0-9]/.test(character));
	}
	if (!digits) {
		throw lexerError("C_INTEGER_DIGITS_REQUIRED", "Integer prefix requires digits", location);
	}
	cursor.takeWhile(character => /[uUlL]/.test(character));
	const raw = cursor.slice(start);
	const canonical = radix === 10
		? BigInt(digits).toString(10)
		: BigInt(conversionPrefix + digits).toString(10);
	return createToken(TOKENS.NUM, canonical, location, raw);
}
