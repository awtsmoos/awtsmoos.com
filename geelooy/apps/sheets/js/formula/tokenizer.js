//B"H
//Boruch Hashem
//Blessed is He

import { formulaError } from "./errors.js";

/**
 * @file Turns formula text into bounded lexical vessels for the safe expression parser.
 * @description The Awtsmoos separates one written stream into measured letters of light;
 * Awtsmoos.com rejects unknown glyphs before they can become execution, keeping formulas bright.
 */
const MAX_SOURCE_LENGTH = 4000;
const MAX_TOKENS = 512;

/** Tokenizes one formula body without using JavaScript evaluation. */
export function tokenizeFormula(source) {
	const text = String(source || "");
	if (text.length > MAX_SOURCE_LENGTH) {
		return formulaError("#LIMIT!");
	}
	const tokens = [];
	let index = 0;
	while (index < text.length) {
		const character = text[index];
		if (/\s/.test(character)) {
			index += 1;
			continue;
		}
		const token = readToken(text, index);
		if (!token) {
			return formulaError("#PARSE!");
		}
		tokens.push(token.value);
		index = token.next;
		if (tokens.length > MAX_TOKENS) {
			return formulaError("#LIMIT!");
		}
	}
	tokens.push({ type: "eof", value: "" });
	return tokens;
}

/** Reads the next number, string, symbol, reference, or identifier. */
function readToken(text, index) {
	return readString(text, index)
		|| readNumber(text, index)
		|| readOperator(text, index)
		|| readWord(text, index)
		|| readPunctuation(text, index);
}

/** Reads a double-quoted string with doubled-quote escaping. */
function readString(text, index) {
	if (text[index] !== '"') {
		return null;
	}
	let value = "";
	let cursor = index + 1;
	while (cursor < text.length) {
		if (text[cursor] === '"' && text[cursor + 1] === '"') {
			value += '"';
			cursor += 2;
			continue;
		}
		if (text[cursor] === '"') {
			return token("string", value, cursor + 1);
		}
		value += text[cursor];
		cursor += 1;
	}
	return null;
}

/** Reads an integer or decimal literal. */
function readNumber(text, index) {
	const match = /^(?:\d+(?:\.\d*)?|\.\d+)/.exec(text.slice(index));
	return match ? token("number", match[0], index + match[0].length) : null;
}

/** Reads comparison, arithmetic, power, modulo, and concatenation operators. */
function readOperator(text, index) {
	const pair = text.slice(index, index + 2);
	if (["<=", ">=", "<>"].includes(pair)) {
		return token("operator", pair, index + 2);
	}
	const character = text[index];
	return "+-*/^%&=<>".includes(character)
		? token("operator", character, index + 1)
		: null;
}

/** Reads either an A1 reference or an identifier/function name. */
function readWord(text, index) {
	const match = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(text.slice(index));
	if (!match) {
		return null;
	}
	const value = match[0];
	const type = /^[A-Za-z]{1,3}[1-9][0-9]{0,4}$/.test(value)
		? "reference"
		: "identifier";
	return token(type, value.toUpperCase(), index + value.length);
}

/** Reads parser punctuation. */
function readPunctuation(text, index) {
	const character = text[index];
	return "(),:".includes(character)
		? token("punctuation", character, index + 1)
		: null;
}

/** Builds one lexical result with the next source index. */
function token(type, value, next) {
	return { next, value: { type, value } };
}
