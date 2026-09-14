//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file tokenizer.js
 * @description
 * Tokenizes PDF object syntax from a Latin-1 source string without evaluating code
 * or importing a parser library. Strings preserve byte values so later text/image
 * layers can choose the correct PDF encoding instead of corrupting source bytes.
 */

import { readHexString, readLiteralString } from "./stringTokenizer.js";

const WHITE = /[\x00\x09\x0a\x0c\x0d\x20]/;
const DELIMITER = /[()<>\[\]{}/%]/;

/**
 * Tokenizes one PDF dictionary/object fragment.
 *
 * @param {string} source Latin-1 PDF syntax.
 * @returns {object[]} Ordered immutable-like lexical testimony.
 */
export function tokenizePdf(source) {
	const tokens = [];
	let index = 0;
	while (index < source.length) {
		index = skipSpace(source, index);
		if (index >= source.length) break;
		const char = source[index];
		if (char === "%") {
			index = skipComment(source, index);
			continue;
		}
		if (source.startsWith("<<", index) || source.startsWith(">>", index)) {
			tokens.push({ type: "delimiter", value: source.slice(index, index + 2) });
			index += 2;
			continue;
		}
		if (char === "[" || char === "]") {
			tokens.push({ type: "delimiter", value: char });
			index += 1;
			continue;
		}
		if (char === "/") {
			const parsed = readName(source, index + 1);
			tokens.push({ type: "name", value: parsed.value });
			index = parsed.index;
			continue;
		}
		if (char === "(") {
			const parsed = readLiteralString(source, index + 1);
			tokens.push({ type: "string", value: parsed.value });
			index = parsed.index;
			continue;
		}
		if (char === "<") {
			const parsed = readHexString(source, index + 1);
			tokens.push({ type: "hex", value: parsed.value });
			index = parsed.index;
			continue;
		}
		const parsed = readWord(source, index);
		const number = Number(parsed.value);
		tokens.push(Number.isFinite(number) && /^[-+]?(?:\d+\.?\d*|\.\d+)$/.test(parsed.value)
			? { type: "number", value: number }
			: { type: "keyword", value: parsed.value });
		index = parsed.index;
	}
	return tokens;
}

/** @param {string} source Source. @param {number} index Cursor. @returns {number} */
function skipSpace(source, index) {
	while (index < source.length && WHITE.test(source[index])) index += 1;
	return index;
}

/** @param {string} source Source. @param {number} index Percent cursor. @returns {number} */
function skipComment(source, index) {
	while (index < source.length && !/[\r\n]/.test(source[index])) index += 1;
	return index;
}

/** @param {string} source Source. @param {number} index Name body cursor. @returns {{value:string,index:number}} */
function readName(source, index) {
	let value = "";
	while (index < source.length && !WHITE.test(source[index]) && !DELIMITER.test(source[index])) {
		if (source[index] === "#" && /^[0-9a-f]{2}$/i.test(source.slice(index + 1, index + 3))) {
			value += String.fromCharCode(parseInt(source.slice(index + 1, index + 3), 16));
			index += 3;
		} else {
			value += source[index++];
		}
	}
	return { value, index };
}

/** @param {string} source Source. @param {number} index Cursor. @returns {{value:string,index:number}} */
function readWord(source, index) {
	const start = index;
	while (index < source.length && !WHITE.test(source[index]) && !DELIMITER.test(source[index])) index += 1;
	return { value: source.slice(start, index), index };
}
