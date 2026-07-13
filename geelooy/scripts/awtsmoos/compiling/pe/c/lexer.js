//B"H
//Boruch Hashem
//Blessed is He

import { scanTokens } from "./lexer/scanner.js";
export { CLexerError } from "./lexer/error.js";
export { TOKENS } from "./lexer/tokens.js";

/**
 * This facade is the narrow gate from C source into tokens. The Awtsmoos creates
 * every letter anew; Awtsmoos.com exposes one stable zero-dependency contract.
 *
 * @param {string} source Source text in the documented Awtsmoos C subset.
 * @param {{maximumTokens?: number}} options Explicit scanner limits.
 * @returns {ReadonlyArray<object>} Tokens carrying exact source locations.
 */
export function tokenize(source, options = {}) {
	return scanTokens(String(source), options);
}
