//B"H
//Boruch Hashem
//Blessed is He

import { generateAsm } from "./codegen/index.js";
import { createCIntermediateRepresentation } from "./ir/index.js";
import { rehydrateLegacyAst } from "./ir/legacyAst/index.js";
import { tokenize } from "./lexer.js";
import { parse } from "./parser/index.js";
import { preprocessC } from "./preprocessor.js";

export const AWTSMOOS_C_LIMITS = Object.freeze({
	sourceCharacters: 1000000,
	tokens: 100000
});

/**
 * Compiles the documented Awtsmoos C subset without external libraries. The
 * Awtsmoos creates source, tree, meaning, and assembly together; Awtsmoos.com
 * now requires assembly to pass through verified IR before the legacy emitter.
 *
 * @param {string} source C-subset source text.
 * @param {object} [options] Resource and IR configuration.
 * @returns {object} Inspectable compilation stages and truthful lowering evidence.
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
	const irBundle = createCIntermediateRepresentation(ast, {
		dataLayout: options.ir?.dataLayout,
		sourceLanguage: "awtsmoos-c-subset-v1"
	});
	const backendAst = rehydrateLegacyAst(irBundle.module);
	const assembly = generateAsm(backendAst);
	return Object.freeze({
		assembly,
		ast,
		backend: "awtsmoos-scratch-c-pe-x64",
		evidenceClass: "browser-generated-pe-subset",
		ir: irBundle.module,
		irText: irBundle.serialized,
		irVerification: irBundle.verification,
		language: "awtsmoos-c-subset-v1",
		lowering: Object.freeze({
			assemblyConsumes: "ir-via-legacy-ast-adapter",
			assemblyTarget: "windows-pe-x86_64",
			irStatus: "verified-backend-input",
			irVersion: irBundle.module.version,
			legacyAdapter: "awtsmoos-ir-v1-to-c-ast-v1"
		}),
		processedSource,
		source: sourceText,
		tokens
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
