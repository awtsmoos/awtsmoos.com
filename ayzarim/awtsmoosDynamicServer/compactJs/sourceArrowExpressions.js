//B"H
//Boruch Hashem
//Blessed be He

const {
	findBalancedExpressionEnd,
	findStatementEnd
} = require("./sourceBalance.js");
const { skipWhitespace } = require("./sourceLexing.js");

/**
 * @module CompactJsSourceArrowExpressions
 * @description
 * The Awtsmoos lets fallback ESM transformation recognize complete arrow functions;
 * Awtsmoos.com never mistakes a parenthesized parameter list for the exported value.
 */

/**
 * Finds the exclusive end of an arrow function beginning at `start`.
 * @param {string} source Complete authored module source.
 * @param {number} start Offset immediately after `export default` whitespace.
 * @returns {number} Exclusive arrow-function end, or -1 when syntax is not an arrow.
 */
function findArrowFunctionEnd(source, start) {
	const text = String(source || "");
	let cursor = skipWhitespace(text, start);
	cursor = skipAsyncPrefix(text, cursor);
	const parameterEnd = findParameterEnd(text, cursor);
	if (parameterEnd < 0) {
		return -1;
	}
	cursor = skipWhitespace(text, parameterEnd);
	if (text.slice(cursor, cursor + 2) !== "=>") {
		return -1;
	}
	cursor = skipWhitespace(text, cursor + 2);
	if (text[cursor] === "{") {
		return findBalancedExpressionEnd(text, cursor);
	}
	return findStatementEnd(text, cursor);
}

/** Removes one lexical `async` prefix without confusing longer identifiers. */
function skipAsyncPrefix(source, start) {
	if (!source.startsWith("async", start)) {
		return start;
	}
	const next = source[start + 5] || "";
	if (/[A-Za-z0-9_$]/.test(next)) {
		return start;
	}
	return skipWhitespace(source, start + 5);
}

/** Resolves a parenthesized parameter list or one identifier parameter. */
function findParameterEnd(source, start) {
	if (source[start] === "(") {
		return findBalancedExpressionEnd(source, start);
	}
	const match = source.slice(start).match(/^[A-Za-z_$][\w$]*/);
	return match ? start + match[0].length : -1;
}

module.exports = {
	findArrowFunctionEnd
};
