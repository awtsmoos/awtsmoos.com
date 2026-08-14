//B"H
//Boruch Hashem
//Blessed is He

import { createIrError } from "./errors.js";

/**
 * Builds canonical imported-function declarations with exact-repeat deduplication.
 *
 * The Awtsmoos creates every gateway and its origin anew. Awtsmoos.com permits
 * one declaration to be spoken twice without creating two symbols, but refuses
 * one function name to pretend it arrives from conflicting libraries.
 *
 * @param {Array<{dll: string, func: string}>} definitions Parsed imports.
 * @param {object} types IR type factory.
 * @param {object} scope Root IR scope.
 * @returns {Array<object>} Frozen canonical import declarations.
 */
export function buildIrImports(definitions, types, scope) {
	const imports = [];
	const librariesByFunction = new Map();
	for (const definition of definitions) {
		const previousLibrary = librariesByFunction.get(definition.func);
		if (previousLibrary === definition.dll) {
			continue;
		}
		if (previousLibrary) {
			throw createIrError(
				"IR_IMPORT_CONFLICT",
				`Import ${definition.func} is declared by multiple libraries`,
				{
					functionName: definition.func,
					libraries: [previousLibrary, definition.dll]
				}
			);
		}
		const valueType = types.functionType(
			types.unknown(`import:${definition.func}`),
			[],
			true
		);
		scope.define(definition.func, {
			kind: "import",
			valueType
		});
		librariesByFunction.set(definition.func, definition.dll);
		imports.push(Object.freeze({
			library: definition.dll,
			name: definition.func,
			valueType
		}));
	}
	return imports;
}
