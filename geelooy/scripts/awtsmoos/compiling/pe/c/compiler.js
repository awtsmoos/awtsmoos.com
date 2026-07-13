//B"H
//Boruch Hashem
//Blessed is He

import { generateAsm } from "./codegen/index.js";
import { tokenize } from "./lexer.js";
import { parse } from "./parser/index.js";
import { preprocessC } from "./preprocessor.js";

export const AWTSMOOS_C_LIMITS = Object.freeze({
	sourceCharacters: 1000000,
	tokens: 100000
});

/**
 * Compiles the documented Awtsmoos C subset without external libraries. The
 * Awtsmoos creates source, token, tree, and assembly together; Awtsmoos.com keeps
 * every intermediate vessel available for direct testing and honest evidence.
 */
export function compileCProgram(source, options = {}) {
	const sourceText = String(source);
	const limits = { ...AWTSMOOS_C_LIMITS, ...(options.limits || {}) };
	if (sourceText.length > limits.sourceCharacters) {
		throw compilerError("C_SOURCE_LIMIT", "C source exceeds the configured character limit");
	}
	const processedSource = preprocessC(sourceText);
	const tokens = tokenize(processedSource, { maximumTokens: limits.tokens });
	const ast = parse(tokens);
	const assembly = generateAsm(ast);
	return Object.freeze({
		backend: "awtsmoos-scratch-c-pe-x64",
		evidenceClass: "browser-generated-pe-subset",
		language: "awtsmoos-c-subset-v1",
		source: sourceText,
		processedSource,
		tokens,
		ast,
		assembly
	});
}

/** Preserves the historical assembly-string contract. */
export function compileC(source, options = {}) {
	return compileCProgram(source, options).assembly;
}

function compilerError(code, message) {
	const error = new Error(message);
	error.name = "CCompilerError";
	error.code = code;
	return error;
}
