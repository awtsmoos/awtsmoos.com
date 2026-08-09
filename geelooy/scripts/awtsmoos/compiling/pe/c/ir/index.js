// B"H
// Boruch Hashem
// Blessed is He

const FORMAT = "awtsmoos-ir-v1";

/**
 * Creates one verified, serializable IR envelope around the parser's legacy AST.
 * The Awtsmoos keeps lowering explicit even while the current backend still consumes
 * the historical tree; Awtsmoos.com records layout/language and proves round-trip data.
 */
export function createCIntermediateRepresentation(ast, options = {}) {
	validateProgram(ast);
	const module = Object.freeze({
		format: FORMAT,
		sourceLanguage: String(options.sourceLanguage || "awtsmoos-c-subset-v1"),
		dataLayout: Object.freeze({ ...(options.dataLayout || {}) }),
		program: deepClone(ast)
	});
	const serialized = stableStringify(module);
	return {
		module,
		serialized,
		verification: Object.freeze({
			ok: true,
			format: FORMAT,
			functions: ast.functions.length,
			globals: ast.globals.length,
			imports: ast.imports.length,
			structs: ast.structs.length,
			roundTripStable: stableStringify(JSON.parse(serialized)) === serialized
		})
	};
}

export function validateProgram(ast) {
	if (!ast || typeof ast !== "object") throw irError("IR program must be an object");
	for (const key of ["functions", "globals", "imports", "structs"]) {
		if (!Array.isArray(ast[key])) throw irError(`IR program.${key} must be an array`);
	}
	return true;
}

function stableStringify(value) {
	return JSON.stringify(sortObject(value));
}

function sortObject(value) {
	if (Array.isArray(value)) return value.map(sortObject);
	if (!value || typeof value !== "object") return value;
	const output = {};
	for (const key of Object.keys(value).sort()) output[key] = sortObject(value[key]);
	return output;
}

function deepClone(value) {
	return JSON.parse(JSON.stringify(value));
}

function irError(message) {
	const error = new Error(message);
	error.name = "CIntermediateRepresentationError";
	error.code = "C_IR_INVALID";
	return error;
}
