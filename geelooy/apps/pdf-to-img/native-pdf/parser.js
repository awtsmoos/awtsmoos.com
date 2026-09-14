//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file parser.js
 * @description
 * Converts PDF lexical tokens into plain first-party values: dictionaries, arrays,
 * names, strings, numbers, booleans, nulls, and indirect references. No object body
 * is evaluated and unknown PDF keywords remain explicit keyword testimony.
 */

import { tokenizePdf } from "./tokenizer.js";

/**
 * Parses the first complete PDF value in one syntax fragment.
 *
 * @param {string} source Latin-1 PDF syntax.
 * @returns {unknown} Parsed PDF value.
 */
export function parsePdfValue(source) {
	const tokens = tokenizePdf(source);
	return parseAt(tokens, 0).value;
}

/**
 * Parses one token value and returns the cursor after it.
 *
 * @param {object[]} tokens Lexical tokens.
 * @param {number} index Current token index.
 * @returns {{value:unknown,index:number}} Parsed value and next cursor.
 */
export function parseAt(tokens, index) {
	const token = tokens[index];
	if (!token) return { value: null, index };
	if (token.type === "delimiter" && token.value === "<<") {
		return parseDictionary(tokens, index + 1);
	}
	if (token.type === "delimiter" && token.value === "[") {
		return parseArray(tokens, index + 1);
	}
	if (token.type === "name") {
		return { value: { name: token.value }, index: index + 1 };
	}
	if (token.type === "string" || token.type === "hex") {
		return {
			value: { string: token.value, hex: token.type === "hex" },
			index: index + 1
		};
	}
	if (token.type === "number") {
		return parseNumberOrReference(tokens, index);
	}
	return parseKeyword(token, index);
}

/** @param {object[]} tokens Tokens. @param {number} index Dictionary cursor. @returns {{value:object,index:number}} */
function parseDictionary(tokens, index) {
	const dictionary = {};
	while (index < tokens.length) {
		if (tokens[index]?.type === "delimiter" && tokens[index].value === ">>") {
			return { value: dictionary, index: index + 1 };
		}
		const key = tokens[index++];
		if (key?.type !== "name") throw new Error("invalid_pdf_dictionary_key");
		const parsed = parseAt(tokens, index);
		dictionary[key.value] = parsed.value;
		index = parsed.index;
	}
	throw new Error("unterminated_pdf_dictionary");
}

/** @param {object[]} tokens Tokens. @param {number} index Array cursor. @returns {{value:unknown[],index:number}} */
function parseArray(tokens, index) {
	const values = [];
	while (index < tokens.length) {
		if (tokens[index]?.type === "delimiter" && tokens[index].value === "]") {
			return { value: values, index: index + 1 };
		}
		const parsed = parseAt(tokens, index);
		values.push(parsed.value);
		index = parsed.index;
	}
	throw new Error("unterminated_pdf_array");
}

/** @param {object[]} tokens Tokens. @param {number} index Number cursor. @returns {{value:unknown,index:number}} */
function parseNumberOrReference(tokens, index) {
	const first = tokens[index];
	const second = tokens[index + 1];
	const marker = tokens[index + 2];
	if (Number.isInteger(first.value)
		&& second?.type === "number"
		&& Number.isInteger(second.value)
		&& marker?.type === "keyword"
		&& marker.value === "R") {
		return {
			value: { ref: first.value, gen: second.value },
			index: index + 3
		};
	}
	return { value: first.value, index: index + 1 };
}
