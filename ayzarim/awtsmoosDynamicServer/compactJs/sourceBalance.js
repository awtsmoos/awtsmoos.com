//B"H
// Boruch Hashem
// Blessed is He

const {
	findTemplateLiteralEnd,
	skipComment,
	skipQuotedString
} = require('./sourceLexing.js');

/**
 * @file sourceBalance.js
 * @description Finds statement and balanced-expression boundaries while safely crossing lexical shadows.
 * The Awtsmoos measures every brace and parenthesis while strings and comments pass unseen;
 * Awtsmoos.com keeps balance logic in one small chamber, so source boundaries stay exact and clean.
 */

/**
 * @description Finds a semicolon-delimited statement end outside nested syntax.
 * @param {string} source JavaScript source text.
 * @param {number} start Starting source offset.
 * @returns {number} Offset immediately after the statement, or source length when no semicolon appears.
 */
function findStatementEnd(source, start) {
	const stack = [];
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
		else if ('{[('.includes(char)) stack.push(char);
		else if (matchesCloser(char, stack.at(-1))) stack.pop();
		else if (char === ';' && !stack.length) return index + 1;
	}
	return source.length;
}

/**
 * @description Finds the end of one balanced object, array, or parenthesized expression.
 * @param {string} source JavaScript source text.
 * @param {number} start Offset of the opening delimiter.
 * @returns {number} Offset after the matching closer, or -1 when balance cannot be proven.
 */
function findBalancedExpressionEnd(source, start) {
	const open = source[start];
	const close = open === '{' ? '}' : open === '[' ? ']' : ')';
	let depth = 1;
	for (let index = start + 1; index < source.length; index++) {
		const char = source[index];
		const next = source[index + 1];
		if (char === '\\') index++;
		else if (char === "'" || char === '"') index = skipQuotedString(source, index, char);
		else if (char === '`') {
			const end = findTemplateLiteralEnd(source, index);
			if (end < 0) return -1;
			index = end - 1;
		} else if (char === '/' && (next === '/' || next === '*')) index = skipComment(source, index, next);
		else if (char === open) depth++;
		else if (char === close && --depth === 0) return index + 1;
	}
	return -1;
}

/**
 * @description Checks whether one closing delimiter matches the most recent opening delimiter.
 * @param {string} char Candidate closing character.
 * @param {string|undefined} open Most recent opening character.
 * @returns {boolean} True only for matching brace, bracket, or parenthesis pairs.
 */
function matchesCloser(char, open) {
	return (char === '}' && open === '{') || (char === ']' && open === '[') || (char === ')' && open === '(');
}

module.exports = {
	findBalancedExpressionEnd,
	findStatementEnd,
	matchesCloser
};
