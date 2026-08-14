//B"H
//Boruch Hashem
//Blessed is He

import { SourceCursor } from "./cursor.js";
import { lexerError } from "./error.js";
import { scanCharacter, scanString } from "./literalScanner.js";
import { scanNumber } from "./numberScanner.js";
import {
	createToken, isIdentifierPart, isIdentifierStart, KEYWORDS,
	MULTI_OPERATORS, PUNCTUATION, SINGLE_OPERATORS, TOKENS
} from "./tokens.js";

/**
 * The scanner separates one stream into many truthful vessels. The Awtsmoos
 * creates stream and boundary together; Awtsmoos.com caps the work explicitly.
 */
export function scanTokens(source, options = {}) {
	const cursor = new SourceCursor(source);
	const tokens = [];
	const maximumTokens = options.maximumTokens || 100000;
	while (!cursor.eof()) {
		skipTrivia(cursor);
		if (cursor.eof()) {
			break;
		}
		const token = scanToken(cursor);
		tokens.push(token);
		if (tokens.length > maximumTokens) {
			throw lexerError("C_TOKEN_LIMIT", "Token limit exceeded", cursor.location());
		}
	}
	tokens.push(createToken(TOKENS.EOF, null, cursor.location()));
	return tokens;
}

function scanToken(cursor) {
	const character = cursor.current();
	if (character === "\"") {
		return scanString(cursor);
	}
	if (character === "'") {
		return scanCharacter(cursor);
	}
	if (/[0-9]/.test(character)) {
		return scanNumber(cursor);
	}
	if (isIdentifierStart(character)) {
		return scanIdentifier(cursor);
	}
	const location = cursor.location();
	if (PUNCTUATION.has(character)) {
		cursor.advance();
		return createToken(TOKENS.PUNCT, character, location, character);
	}
	const operator = MULTI_OPERATORS.find(value => cursor.startsWith(value));
	if (operator) {
		for (let index = 0; index < operator.length; index++) {
			cursor.advance();
		}
		return createToken(TOKENS.OP, operator, location, operator);
	}
	if (SINGLE_OPERATORS.has(character)) {
		cursor.advance();
		return createToken(TOKENS.OP, character, location, character);
	}
	throw lexerError("C_CHARACTER_UNEXPECTED", `Unexpected character '${character}'`, location);
}

function scanIdentifier(cursor) {
	const location = cursor.location();
	const value = cursor.takeWhile(isIdentifierPart);
	const type = KEYWORDS.has(value) ? TOKENS.KEYWORD : TOKENS.ID;
	return createToken(type, value, location, value);
}

function skipTrivia(cursor) {
	let advanced = true;
	while (advanced && !cursor.eof()) {
		advanced = false;
		while (/\s/.test(cursor.current())) {
			cursor.advance();
			advanced = true;
		}
		if (cursor.startsWith("//")) {
			cursor.takeWhile(character => character !== "\n" && character !== "\r");
			advanced = true;
		} else if (cursor.startsWith("/*")) {
			skipBlockComment(cursor);
			advanced = true;
		}
	}
}

function skipBlockComment(cursor) {
	const location = cursor.location();
	cursor.advance();
	cursor.advance();
	while (!cursor.eof() && !cursor.startsWith("*/")) {
		cursor.advance();
	}
	if (cursor.eof()) {
		throw lexerError("C_COMMENT_UNTERMINATED", "Block comment is not terminated", location);
	}
	cursor.advance();
	cursor.advance();
}
