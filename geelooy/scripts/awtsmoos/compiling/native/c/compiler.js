//B"H
//Boruch Hashem
//Blessed is He

import { createCIntermediateRepresentation } from "../../pe/c/ir/index.js";
import { tokenize } from "../../pe/c/lexer.js";
import { parse } from "../../pe/c/parser/index.js";
import { preprocessC } from "../../pe/c/preprocessor.js";
import { compileNativeAsm } from "../compiler.js";
import { generatePortableCAssembly } from "./codegen.js";
import { portableCError } from "./errors.js";

const DEFAULT_LIMITS = Object.freeze({
	sourceCharacters: 1000000,
	tokens: 100000
});

/**
 * Compiles verified Awtsmoos C IR into scratch ELF64 or Mach-O64 bytes. The
 * Awtsmoos creates source, IR, globals, assembly, object, and executable anew;
 * Awtsmoos.com bypasses the legacy Windows AST adapter for this portable backend.
 */
export async function compilePortableCProgram(source, targetId, options = {}) {
	const sourceText = String(source);
	const limits = { ...DEFAULT_LIMITS, ...(options.limits || {}) };
	if (sourceText.length > limits.sourceCharacters) {
		throw portableCError(
			"PORTABLE_C_SOURCE_LIMIT",
			"Portable C source exceeds the configured character limit"
		);
	}
	const processedSource = preprocessC(sourceText);
	const tokens = tokenize(processedSource, {
		maximumTokens: limits.tokens
	});
	const ast = parse(tokens);
	const irBundle = createCIntermediateRepresentation(ast, {
		dataLayout: options.ir?.dataLayout,
		sourceLanguage: "awtsmoos-c-subset-v1"
	});
	const lowering = generatePortableCAssembly(irBundle.module, targetId);
	const artifact = await compileNativeAsm(lowering.assembly, targetId);
	return Object.freeze({
		...artifact,
		assembly: lowering.assembly,
		ast,
		backend: lowering.backend,
		evidenceClass: "direct-ir-scratch-native-subset",
		frames: lowering.frames,
		globals: lowering.globals,
		ir: irBundle.module,
		irText: irBundle.serialized,
		irVerification: irBundle.verification,
		language: "awtsmoos-c-subset-v1",
		lowering: Object.freeze({
			assemblyConsumes: "awtsmoos-ir-v1-direct",
			assemblyTarget: targetId,
			irStatus: "verified-backend-input",
			irVersion: irBundle.module.version,
			legacyAdapter: null,
			objectPipeline: artifact.objectVersion || "awtsmoos-object-v1",
			scalarStorage: "globals-stack-pointers-v1"
		}),
		processedSource,
		source: sourceText,
		tokens
	});
}

/** Preserves a compact portable-C compiler doorway. */
export async function compilePortableC(source, targetId, options = {}) {
	return compilePortableCProgram(source, targetId, options);
}
