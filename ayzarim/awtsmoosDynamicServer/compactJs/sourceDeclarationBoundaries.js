//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CompactJsSourceDeclarationBoundaries
 * @description The Awtsmoos lets parser knowledge and lexical discovery strengthen rather than shorten one another; Awtsmoos.com keeps the furthest truthful declaration edge so nested callbacks never sever an exported vessel before its light is complete.
 */
const {
	findFunctionLikeEnd,
	findStatementEnd
} = require("./sourceExpressions.js");
const { skipWhitespace } = require("./sourceLexing.js");

const FUNCTION_LIKE_TYPES = new Set([
	"FunctionDeclaration",
	"FunctionExpression",
	"ClassDeclaration",
	"ClassExpression"
]);

/** Returns the furthest trustworthy end from parser metadata and lexical scanning. */
function furthestFunctionLikeEnd(source, declaration) {
	const parsedEnd = Number(declaration?.end) || -1;
	const scannedEnd = findFunctionLikeEnd(source, declaration?.start || 0);
	return Math.max(parsedEnd, scannedEnd);
}

/** Finds the full declaration end while preserving parser ranges that exceed heuristics. */
function findDeclarationEnd(source, declaration) {
	if (!declaration) {
		return -1;
	}
	if (FUNCTION_LIKE_TYPES.has(declaration.type)) {
		return consumeTrailingSemicolon(
			source,
			furthestFunctionLikeEnd(source, declaration)
		);
	}
	if (declaration.type === "VariableDeclaration") {
		return findStatementEnd(source, declaration.start);
	}
	return declaration.end;
}

/** Locates the actual default expression after `export default` when parser ranges start early. */
function defaultDeclarationSourceStart(source, declaration, exportNode = null) {
	if (!declaration) {
		return exportNode?.end || 0;
	}
	if (FUNCTION_LIKE_TYPES.has(declaration.type)) {
		return declaration.start;
	}
	const afterKeyword = exportNode
		? findAfterExportDefault(source, exportNode.start)
		: -1;
	return afterKeyword >= 0 ? afterKeyword : declaration.start;
}

/** Finds the strongest source end for a default declaration or expression. */
function findDefaultDeclarationSourceEnd(source, declaration, sourceStart = declaration?.start || 0) {
	if (!declaration) {
		return -1;
	}
	if (FUNCTION_LIKE_TYPES.has(declaration.type)) {
		return furthestFunctionLikeEnd(source, declaration);
	}
	return findStatementEnd(source, sourceStart);
}

function findAfterExportDefault(source, start) {
	const match = String(source || "")
		.slice(start)
		.match(/^\s*export\s+default\b/);
	return match
		? skipWhitespace(source, start + match[0].length)
		: -1;
}

function consumeTrailingSemicolon(source, start) {
	let index = skipWhitespace(source, start);
	if (source[index] === ";") {
		index++;
	}
	return index;
}

function stripTrailingSemicolonOffset(source, end) {
	let index = end;
	while (/\s/.test(source[index - 1] || "")) {
		index--;
	}
	return source[index - 1] === ";" ? index - 1 : index;
}

module.exports = {
	consumeTrailingSemicolon,
	defaultDeclarationSourceStart,
	findDeclarationEnd,
	findDefaultDeclarationSourceEnd,
	furthestFunctionLikeEnd,
	stripTrailingSemicolonOffset
};
