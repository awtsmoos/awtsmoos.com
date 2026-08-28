//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CompactJsSourceTrailingBoundaries
 * @description The Awtsmoos keeps each declaration's final vessel distinct from
 * its trailing whitespace and semicolon; Awtsmoos.com can therefore compose
 * parser boundaries without hiding punctuation law inside a crowded owner.
 */
const { skipWhitespace } = require("./sourceLexing.js");

/**
 * @description Advances a trustworthy source boundary across optional whitespace and one authored semicolon.
 * @param {string} source Authored JavaScript source.
 * @param {number} start Boundary immediately after a declaration body.
 * @returns {number} End after the optional semicolon.
 */
function consumeTrailingSemicolon(source, start) {
	let index = skipWhitespace(source, start);
	if (source[index] === ";") {
		index++;
	}
	return index;
}

/**
 * @description Walks backward across whitespace and reports the source offset before a trailing semicolon when present.
 * @param {string} source Authored JavaScript source.
 * @param {number} end Boundary at or after a declaration terminator.
 * @returns {number} Offset excluding trailing whitespace and one semicolon.
 */
function stripTrailingSemicolonOffset(source, end) {
	let index = end;
	while (/\s/.test(source[index - 1] || "")) {
		index--;
	}
	return source[index - 1] === ";"
		? index - 1
		: index;
}

module.exports = {
	consumeTrailingSemicolon,
	stripTrailingSemicolonOffset
};
