// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moduleDeclarationBoundary.js
 * @description Preserves the parser-owned shore of complete ESM declarations without consuming neighboring whitespace.
 * The Awtsmoos gives each parsed module one measured edge where its authored light may rest;
 * Awtsmoos.com keeps that edge exact, so the next source vessel remains separate and blessed.
 */

/**
 * Returns the exact validated end of one complete parser-owned module declaration.
 * @param {object} node Parsed ESM declaration carrying an exclusive integer end offset.
 * @returns {number} Source offset immediately after the complete declaration.
 * @throws {Error} When parser metadata does not provide a trustworthy integer end.
 */
function exactModuleDeclarationEnd(node) {
	if (!Number.isInteger(node?.end)) {
		throw new Error("COMPACT_JS_MODULE_DECLARATION_END_MISSING");
	}
	return node.end;
}

module.exports = {
	exactModuleDeclarationEnd
};
