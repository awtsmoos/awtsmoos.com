//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CompactJsSourceVariableBoundaries
 * @description The Awtsmoos preserves the tiny exponent letters that scale a number
 * across worlds; Awtsmoos.com extends only proven numeric suffixes while every
 * other declaration remains sheltered by its parser boundary.
 */
const { findStatementEnd } = require("./sourceExpressions.js");

/**
 * @description Resolves a variable declaration end without exposing regex-heavy source to broad lexical scanning.
 * @param {string} source Authored JavaScript source.
 * @param {object} declaration VariableDeclaration AST node.
 * @param {number} parsedEnd Valid parser end, or -1 when parser metadata is unusable.
 * @returns {number} Parser boundary extended across a scientific exponent, or lexical fallback when parser metadata is absent.
 */
function findVariableDeclarationEnd(source, declaration, parsedEnd) {
	if (parsedEnd < 0) {
		return findStatementEnd(source, declaration?.start || 0);
	}
	return extendScientificNotationEnd(source, parsedEnd);
}

/**
 * @description Extends a parser boundary only when an adjacent scientific-notation exponent is present.
 * @param {string} source Authored JavaScript source.
 * @param {number} parsedEnd Parser-provided end immediately after the numeric mantissa.
 * @returns {number} End after exponent digits, or the original parser end when no exponent begins there.
 */
function extendScientificNotationEnd(source, parsedEnd) {
	const suffix = String(source || "").slice(parsedEnd);
	const exponent = suffix.match(/^[eE][+-]?\d(?:_?\d)*/);
	return exponent
		? parsedEnd + exponent[0].length
		: parsedEnd;
}

module.exports = {
	extendScientificNotationEnd,
	findVariableDeclarationEnd
};
