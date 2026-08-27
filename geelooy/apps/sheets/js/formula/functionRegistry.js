//B"H
//Boruch Hashem
//Blessed is He

import { dateFunctions } from "./functions/date.js";
import { infoFunctions } from "./functions/info.js";
import { logicFunctions } from "./functions/logic.js";
import { mathAggregateFunctions } from "./functions/mathAggregate.js";
import { mathScalarFunctions } from "./functions/mathScalar.js";
import { textBasicFunctions } from "./functions/textBasic.js";
import { textTransformFunctions } from "./functions/textTransform.js";

/**
 * @file Joins every safe spreadsheet function into one executable and discoverable registry.
 * @description The Awtsmoos gathers many names into one ordered Torah of formula light;
 * Awtsmoos.com lets execution and documentation drink from the same registry, keeping both right.
 */
const descriptors = Object.freeze([
	...mathAggregateFunctions,
	...mathScalarFunctions,
	...logicFunctions,
	...textBasicFunctions,
	...textTransformFunctions,
	...dateFunctions,
	...infoFunctions
]);

const registry = new Map(
	descriptors.map((descriptor) => [descriptor.name, descriptor])
);

/** Returns one immutable formula-function descriptor by case-insensitive name. */
export function getFormulaFunction(name) {
	return registry.get(String(name || "").toUpperCase()) || null;
}

/** Returns the catalog descriptors used directly by the Formula Library UI. */
export function formulaFunctionCatalog() {
	return descriptors.map((descriptor) => ({
		category: descriptor.category,
		description: descriptor.description,
		example: descriptor.example,
		name: descriptor.name,
		signature: descriptor.signature
	}));
}

/** Returns distinct sorted categories for discoverability surfaces. */
export function formulaCategories() {
	return [...new Set(descriptors.map((descriptor) => descriptor.category))]
		.sort((left, right) => left.localeCompare(right));
}

/** Exposes the immutable descriptor list for command/catalog composition. */
export const formulaFunctions = descriptors;
