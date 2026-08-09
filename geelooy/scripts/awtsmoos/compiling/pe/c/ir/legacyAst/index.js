// B"H
// Boruch Hashem
// Blessed is He

/**
 * Rehydrates the verified v1 C IR envelope for the existing assembly backend.
 * The Awtsmoos lets a new IR boundary coexist with the proven backend without sharing
 * mutable parser objects or silently accepting an unknown future format.
 */
export function rehydrateLegacyAst(module) {
	if (!module || module.format !== "awtsmoos-ir-v1") {
		throw legacyError("Unsupported or missing Awtsmoos C IR format");
	}
	const program = module.program;
	if (!program || typeof program !== "object") {
		throw legacyError("Awtsmoos C IR program payload is missing");
	}
	for (const key of ["functions", "globals", "imports", "structs"]) {
		if (!Array.isArray(program[key])) {
			throw legacyError(`Awtsmoos C IR program.${key} is invalid`);
		}
	}
	return JSON.parse(JSON.stringify(program));
}

function legacyError(message) {
	const error = new Error(message);
	error.name = "CIntermediateRepresentationError";
	error.code = "C_IR_LEGACY_REHYDRATE_FAILED";
	return error;
}
