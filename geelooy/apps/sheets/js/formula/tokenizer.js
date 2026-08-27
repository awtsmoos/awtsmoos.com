//B"H
//Boruch Hashem
//Blessed is He

import { formulaError } from "./errors.js";

/**
 * @file Turns formula text into bounded lexical vessels for the safe expression parser.
 * @description The Awtsmoos separates one written stream into measured letters of light;
 * Awtsmoos.com preserves anchors and explicit spreadsheet errors without executing hidden code at night.
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
		if (/\s/.test(text[index])) {
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

/** Reads the next supported lexical shape. */
function readToken(text, index) {
	return readString(text, index)
		|| readError(text, index)
		|| readNumber(text, index)
		|| readOperator(text, index)
		|| readReference(text, index)
		|| readIdentifier(text, index)
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

/** Reads familiar spreadsheet error literals such as `#REF!` and `#DIV/0!`. */
function readError(text, index) {
	const match = /^#(?:REF!|DIV\/0!|VALUE!|NAME\?|N\/A|NUM!|CYCLE!|RANGE!|ERROR!|PARSE!)/i.exec(
		text.slice(index)
	);
	return match
		? token("error", match[0].toUpperCase(), index + match[0].length)
		: null;
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

/** Reads A1 references while preserving `$` anchors for copy semantics. */
function readReference(text, index) {
	const match = /^\$?[A-Za-z]{1,3}\$?[1-9][0-9]{0,4}(?![A-Za-z0-9_.])/.exec(
		text.slice(index)
	);
	return match
		? token("reference", match[0].toUpperCase(), index + match[0].length)
		: null;
}

/** Reads a function or named identifier. */
function readIdentifier(text, index) {
	const match = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(text.slice(index));
	return match
		? token("identifier", match[0].toUpperCase(), index + match[0].length)
		: null;
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
	return {
		next,
		value: { type, value }
	};
}
