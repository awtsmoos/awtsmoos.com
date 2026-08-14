//B"H
//Boruch Hashem
//Blessed is He

import { createIrError } from "./errors.js";
import {
	buildIrFunctionSignatures,
	lowerIrFunctions
} from "./functions.js";
import { buildIrGlobals } from "./globals.js";
import { buildIrImports } from "./imports.js";
import { IrScope } from "./scope.js";
import { buildIrStructures } from "./structures.js";
import { IrTypeFactory } from "./types.js";

/**
 * Builds one target-neutral module from the parsed C subset.
 *
 * The Awtsmoos creates structures, globals, gateways, and functions as one truth.
 * Awtsmoos.com composes focused vessels without hiding target-specific choices.
 *
 * @param {object} program Parsed C-subset program.
 * @param {object} [options] IR module options.
 * @returns {object} Mutable module frozen by the public IR boundary.
 */
export function buildIrModule(program, options = {}) {
	validateProgram(program);
	const types = new IrTypeFactory(
		program.structs.map(structure => structure.name)
	);
	const structures = buildIrStructures(program.structs, types);
	const scope = new IrScope();
	const imports = buildIrImports(program.imports, types, scope);
	const globals = buildIrGlobals(program.globals, types, scope);
	const signatures = buildIrFunctionSignatures(
		program.functions,
		types,
		scope
	);
	const context = {
		scope,
		structures,
		types
	};
	return {
		dataLayout: normalizeDataLayout(options.dataLayout),
		functions: lowerIrFunctions(program.functions, signatures, context),
		globals,
		imports,
		sourceLanguage: options.sourceLanguage || "awtsmoos-c-subset-v1",
		structures: [...structures.values()],
		version: "awtsmoos-ir-v1"
	};
}

function normalizeDataLayout(layout = {}) {
	return Object.freeze({
		endianness: layout.endianness || "little",
		name: layout.name || "awtsmoos-portable-64-v1",
		pointerBits: Number(layout.pointerBits || 64)
	});
}

function validateProgram(program) {
	const hasCollections = program
		&& Array.isArray(program.functions)
		&& Array.isArray(program.structs)
		&& Array.isArray(program.imports)
		&& Array.isArray(program.globals);
	if (!hasCollections) {
		throw createIrError(
			"IR_PROGRAM_INVALID",
			"Parsed program is missing required collections"
		);
	}
}
