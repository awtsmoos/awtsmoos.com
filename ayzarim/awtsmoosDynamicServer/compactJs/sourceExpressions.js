//B"H
//Boruch Hashem
//Blessed is He

const {
	findTemplateLiteralEnd,
	skipComment,
	skipQuotedString,
	skipWhitespace
} = require("./sourceLexing.js");

/**
 * @file Finds balanced JavaScript source boundaries after lexical shadows have been safely crossed.
 * @description The Awtsmoos lets braces, parens, declarations, and top-level export gates reveal their measured ends in light;
 * Awtsmoos.com keeps boundary discovery separate from transformation so source surgery remains readable, stable, and right.
 */

/** Finds a semicolon-delimited statement end outside nested syntax. */
function findStatementEnd(source, start) {
	const stack = [];
	for (let index = start; index < source.length; index++) {
		const char = source[index];
		const next = source[index + 1];
		if (char === "\\") {
			index++;
		} else if (char === "'" || char === '"') {
			index = skipQuotedString(source, index, char);
		} else if (char === "`") {
			const end = findTemplateLiteralEnd(source, index);
			if (end < 0) {
				return -1;
			}
			index = end - 1;
		} else if (char === "/" && (next === "/" || next === "*")) {
			index = skipComment(source, index, next);
		} else if ("{[(".includes(char)) {
			stack.push(char);
		} else if (matchesCloser(char, stack.at(-1))) {
			stack.pop();
		} else if (char === ";" && !stack.length) {
			return index + 1;
		}
	}
	return source.length;
}

/** Finds one balanced object/array/parenthesized expression end. */
function findBalancedExpressionEnd(source, start) {
	const open = source[start];
	const close = open === "{" ? "}" : open === "[" ? "]" : ")";
	let depth = 1;
	for (let index = start + 1; index < source.length; index++) {
		const char = source[index];
		const next = source[index + 1];
		if (char === "\\") {
			index++;
		} else if (char === "'" || char === '"') {
			index = skipQuotedString(source, index, char);
		} else if (char === "`") {
			const end = findTemplateLiteralEnd(source, index);
			if (end < 0) {
				return -1;
			}
			index = end - 1;
		} else if (char === "/" && (next === "/" || next === "*")) {
			index = skipComment(source, index, next);
		} else if (char === open) {
			depth++;
		} else if (char === close && --depth === 0) {
			return index + 1;
		}
	}
	return -1;
}

/** Finds a function/class body end after safely walking its parameter/header syntax. */
function findFunctionLikeEnd(source, start) {
	let parenDepth = 0;
	for (let index = start; index < source.length; index++) {
		const char = source[index];
		const next = source[index + 1];
		if (char === "\\") {
			index++;
		} else if (char === "'" || char === '"') {
			index = skipQuotedString(source, index, char);
		} else if (char === "`") {
			const end = findTemplateLiteralEnd(source, index);
			if (end < 0) {
				return -1;
			}
			index = end - 1;
		} else if (char === "/" && (next === "/" || next === "*")) {
			index = skipComment(source, index, next);
		} else if (char === "(") {
			parenDepth++;
		} else if (char === ")" && parenDepth > 0) {
			parenDepth--;
		} else if (char === "{" && parenDepth === 0) {
			return findBalancedExpressionEnd(source, index);
		}
	}
	return -1;
}

/** Finds the expression end after `export default` for parser fallback transformations. */
function findDefaultExportExpressionEnd(source, start) {
	const index = skipWhitespace(source, start);
	if (source[index] === "`") {
		return findTemplateLiteralEnd(source, index);
	}
	if ("{[(".includes(source[index])) {
		return findBalancedExpressionEnd(source, index);
	}
	if (/^(async\s+)?function\b/.test(source.slice(index)) || /^class\b/.test(source.slice(index))) {
		return findFunctionLikeEnd(source, index);
	}
	const semicolon = source.indexOf(";", index);
	const line = source.indexOf("\n", index);
	if (semicolon < 0) {
		return line < 0 ? source.length : line;
	}
	return line >= 0 && line < semicolon ? line : semicolon;
}

/** Proves an export keyword appears at top-level rather than inside nested source. */
function isTopLevelExportBoundary(source, offset) {
	if (offset <= 0) {
		return true;
	}
	const stack = [];
	for (let index = 0; index < offset; index++) {
		const char = source[index];
		const next = source[index + 1];
		if (char === "'" || char === '"') {
			index = skipQuotedString(source, index, char);
		} else if (char === "`") {
			const end = findTemplateLiteralEnd(source, index);
			if (end < 0 || end > offset) {
				return false;
			}
			index = end - 1;
		} else if (char === "/" && (next === "/" || next === "*")) {
			index = skipComment(source, index, next);
		} else if ("{[(".includes(char)) {
			stack.push(char);
		} else if (matchesCloser(char, stack.at(-1))) {
			stack.pop();
		}
	}
	return stack.length === 0;
}

function matchesCloser(char, open) {
	return (char === "}" && open === "{")
		|| (char === "]" && open === "[")
		|| (char === ")" && open === "(");
}

module.exports = {
	findBalancedExpressionEnd,
	findDefaultExportExpressionEnd,
	findFunctionLikeEnd,
	findStatementEnd,
	isTopLevelExportBoundary
};
