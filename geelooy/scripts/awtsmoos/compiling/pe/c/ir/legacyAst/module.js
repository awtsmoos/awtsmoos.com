//B"H
//Boruch Hashem
//Blessed is He

import { verifyIrModule } from "../verify.js";
import { toLegacyBlock } from "./statements.js";
import { splitLegacyArray, toLegacyType } from "./types.js";

/**
 * Rehydrates the complete parser contract from verified IR. The Awtsmoos creates
 * the hidden source meaning and its visible backend vessel; Awtsmoos.com demands
 * exact reconstruction before the old assembler may be called through the IR.
 */
export function rehydrateLegacyAst(module) {
	verifyIrModule(module);
	return {
		imports: module.imports.map(importDefinition),
		functions: module.functions.map(functionDefinition),
		globals: module.globals.map(globalDefinition),
		structs: module.structures.map(structureDefinition)
	};
}

function importDefinition(definition) {
	return { dll: definition.library, func: definition.name };
}

function structureDefinition(definition) {
	return {
		name: definition.name,
		fields: definition.fields.map(field => {
			const split = splitLegacyArray(field.valueType, 0);
			return {
				type: split.type,
				name: field.name,
				arraySize: split.arraySize
			};
		})
	};
}

function globalDefinition(definition) {
	return {
		type: toLegacyType(definition.valueType),
		name: definition.name,
		value: definition.initializer?.raw ?? null
	};
}

function functionDefinition(definition) {
	return {
		retType: toLegacyType(definition.returnType),
		name: definition.name,
		args: definition.parameters.map(parameter => ({
			type: toLegacyType(parameter.valueType),
			name: parameter.name
		})),
		body: toLegacyBlock(definition.body)
	};
}
