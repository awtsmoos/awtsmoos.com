//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CompactJsSourceDeclarationBoundaries
 * @description The Awtsmoos lets parser truth lead while lexical fallback guards
 * incomplete ranges; Awtsmoos.com keeps each declaration inside its lawful shore.
 */
const {
	findFunctionLikeEnd,
	findStatementEnd
} = require("./sourceExpressions.js");
const { skipWhitespace } = require("./sourceLexing.js");
const {
	consumeTrailingSemicolon,
	stripTrailingSemicolonOffset
} = require("./sourceTrailingBoundaries.js");
const { findVariableDeclarationEnd } = require("./sourceVariableBoundaries.js");

const FUNCTION_LIKE_TYPES = new Set([
	"FunctionDeclaration",
	"FunctionExpression",
	"ClassDeclaration",
	"ClassExpression"
]);

/** Returns the furthest trustworthy end from parser metadata and lexical scanning. */
function furthestFunctionLikeEnd(source, declaration) {
	const parsedEnd = validParsedEnd(source, declaration);
	const scannedEnd = findFunctionLikeEnd(source, declaration?.start || 0);
	return Math.max(parsedEnd, scannedEnd);
}

/** Returns a parser boundary only when it is numerically inside the source after the declaration start. */
function validParsedEnd(source, declaration) {
	const start = Number(declaration?.start);
	const end = Number(declaration?.end);
	return Number.isFinite(start)
		&& Number.isFinite(end)
		&& end > start
		&& end <= String(source || "").length
		? end
		: -1;
}

/** Finds the declaration end, extending only proven scientific-number truncation before lexical fallback. */
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
		const parsedEnd = validParsedEnd(source, declaration);
		return consumeTrailingSemicolon(
			source,
			findVariableDeclarationEnd(source, declaration, parsedEnd)
		);
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

module.exports = {
	consumeTrailingSemicolon,
	defaultDeclarationSourceStart,
	findDeclarationEnd,
	findDefaultDeclarationSourceEnd,
	furthestFunctionLikeEnd,
	stripTrailingSemicolonOffset,
	validParsedEnd
};
