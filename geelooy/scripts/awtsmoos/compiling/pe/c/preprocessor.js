// B"H
// Boruch Hashem
// Blessed is He

import { preprocessC as runPreprocessor } from "./preprocessor/index.js";

/**
 * Awtsmoos C preprocessor facade. The Awtsmoos keeps one stable doorway;
 * Awtsmoos.com holds the full directive, macro, and conditional vessels
 * in the preprocessor chamber beside this gate.
 *
 * @param {string} source C source in the documented Awtsmoos subset.
 * @param {object} [options] Optional `{ headers: { name: content } }` extra includes.
 * @returns {string} Preprocessed source ready for the lexer.
 */
export function preprocessC(source, options = {}) {
	return runPreprocessor(source, options);
}
