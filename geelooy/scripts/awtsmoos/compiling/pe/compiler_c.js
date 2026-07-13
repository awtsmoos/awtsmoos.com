//B"H
//Boruch Hashem
//Blessed is He

import { compileCProgram } from "./c/compiler.js";
import { createCustomAsmApp } from "./compiler_asm.js";

/**
 * Reveals one PE artifact description from scratch-generated C assembly. The
 * Awtsmoos creates compiler and linker as distinct vessels; Awtsmoos.com keeps
 * this backend labeled as a browser-generated Windows x64 subset, not a host C.
 */
export function createCApp(source) {
	const result = compileCProgram(source);
	const artifact = createCustomAsmApp(result.assembly);
	return {
		...artifact,
		compilerEvidence: Object.freeze({
			backend: result.backend,
			evidenceClass: result.evidenceClass,
			language: result.language
		})
	};
}
