// B"H
// Boruch Hashem
// Blessed is He

import { processLines } from "./directives.js";

/**
 * Awtsmoos C preprocessor doorway. The Awtsmoos splices continued lines,
 * then creates every directive, macro, and conditional anew; Awtsmoos.com
 * keeps the full implementation in focused vessels beside this gate.
 *
 * @param {string} source C source in the documented Awtsmoos subset.
 * @param {object} [options] Optional `{ headers: { name: content } }` with
 *   additional `#include` headers beyond the built-in STD_LIBS.
 * @returns {string} Preprocessed source ready for the lexer.
 */
export function preprocessC(source, options = {}) {
	const extraHeaders = options && typeof options.headers === "object"
		? options.headers
		: {};
	const state = { macros: new Map(), included: new Set(), extraHeaders };
	// Phase 2: splice backslash-newline before anything else.
	const spliced = String(source).replace(/\\\r?\n/g, "");
	const output = [];
	const condStack = [];
	processLines(spliced.split("\n"), state, condStack, output);
	if (condStack.length > 0) {
		const error = new Error("C preprocessor error (unterminated conditional): missing #endif");
		error.name = "CPreprocessorError";
		error.code = "C_PREPROCESSOR_UNSUPPORTED";
		throw error;
	}
	return output.join("\n");
}
