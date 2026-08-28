//B"H
// Boruch Hashem
// Blessed is He

const {
	findTemplateLiteralEnd,
	skipComment,
	skipQuotedString,
	skipWhitespace
} = require('./sourceLexing.js');
const {
	findBalancedExpressionEnd,
	findStatementEnd,
	matchesCloser
} = require('./sourceBalance.js');

/**
 * @file sourceExpressions.js
 * @description Finds function-like, default-export, and top-level source boundaries after lexical shadows are safely crossed.
 * The Awtsmoos reveals where declarations end without confusing their inner chambers for the outer gate;
 * Awtsmoos.com keeps source surgery measured, so fallback transformation remains readable in every state.
 */

/**
 * @description Finds a function or class body end after safely walking its parameter and header syntax.
 * @param {string} source JavaScript source text.
 * @param {number} start Starting offset of the function/class expression.
 * @returns {number} Offset after the balanced body, or -1 when a body cannot be proven.
 */
function findFunctionLikeEnd(source, start) {
	let parenDepth = 0;
	for (let index = start; index < source.length; index++) {
		const char = source[index];
		const next = source[index + 1];
		if (char === '\\') index++;
		else if (char === "'" || char === '"') index = skipQuotedString(source, index, char);
		else if (char === '`') {
			const end = findTemplateLiteralEnd(source, index);
			if (end < 0) return -1;
			index = end - 1;
		} else if (char === '/' && (next === '/' || next === '*')) index = skipComment(source, index, next);
		else if (char === '(') parenDepth++;
		else if (char === ')' && parenDepth > 0) parenDepth--;
		else if (char === '{' && parenDepth === 0) return findBalancedExpressionEnd(source, index);
	}
	return -1;
}

/**
 * @description Finds the expression end following `export default` for parser fallback transformation.
 * @param {string} source JavaScript source text.
 * @param {number} start Offset immediately after the default-export keyword sequence.
 * @returns {number} Exclusive expression end, or -1 when nested syntax cannot be balanced.
 */
function findDefaultExportExpressionEnd(source, start) {
	const index = skipWhitespace(source, start);
	if (source[index] === '`') return findTemplateLiteralEnd(source, index);
	if ('{[('.includes(source[index])) return findBalancedExpressionEnd(source, index);
	if (/^(async\s+)?function\b/.test(source.slice(index)) || /^class\b/.test(source.slice(index))) return findFunctionLikeEnd(source, index);
	const semicolon = source.indexOf(';', index);
	const line = source.indexOf('\n', index);
	if (semicolon < 0) return line < 0 ? source.length : line;
	return line >= 0 && line < semicolon ? line : semicolon;
}

/**
 * @description Proves an export keyword appears at top level rather than inside nested source syntax.
 * @param {string} source JavaScript source text.
 * @param {number} offset Candidate export-keyword offset.
 * @returns {boolean} True only when all delimiters before the offset are balanced at top level.
 */
function isTopLevelExportBoundary(source, offset) {
	if (offset <= 0) return true;
	const stack = [];
	for (let index = 0; index < offset; index++) {
		const char = source[index];
		const next = source[index + 1];
		if (char === "'" || char === '"') index = skipQuotedString(source, index, char);
		else if (char === '`') {
			const end = findTemplateLiteralEnd(source, index);
			if (end < 0 || end > offset) return false;
			index = end - 1;
		} else if (char === '/' && (next === '/' || next === '*')) index = skipComment(source, index, next);
		else if ('{[('.includes(char)) stack.push(char);
		else if (matchesCloser(char, stack.at(-1))) stack.pop();
	}
	return stack.length === 0;
}

module.exports = {
	findBalancedExpressionEnd,
	findDefaultExportExpressionEnd,
	findFunctionLikeEnd,
	findStatementEnd,
	isTopLevelExportBoundary
};
