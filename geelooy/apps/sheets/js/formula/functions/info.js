//B"H
//Boruch Hashem
//Blessed is He

import { isBlank } from "../coercion.js";
import { isFormulaError } from "../errors.js";
import { functionDescriptor } from "./helpers.js";

/**
 * @file Registers information predicates that let formulas inspect values without mutating them.
 * @description The Awtsmoos reveals what kind of vessel each value has beneath its visible light;
 * Awtsmoos.com lets formulas ask what is blank, numeric, textual, or error and receive the answer right.
 */
export const infoFunctions = Object.freeze([
	functionDescriptor(
		"ISBLANK",
		"Information",
		"ISBLANK(value)",
		"Returns TRUE when a value is semantically blank.",
		"=ISBLANK(A1)",
		(args) => isBlank(args[0])
	),
	functionDescriptor(
		"ISNUMBER",
		"Information",
		"ISNUMBER(value)",
		"Returns TRUE when a value is a finite number.",
		"=ISNUMBER(A1)",
		(args) => typeof args[0] === "number" && Number.isFinite(args[0])
	),
	functionDescriptor(
		"ISTEXT",
		"Information",
		"ISTEXT(value)",
		"Returns TRUE when a value is text.",
		"=ISTEXT(A1)",
		(args) => typeof args[0] === "string"
	),
	functionDescriptor(
		"ISERROR",
		"Information",
		"ISERROR(value)",
		"Returns TRUE when a value is an explicit spreadsheet error.",
		"=ISERROR(A1)",
		(args) => isFormulaError(args[0])
	)
]);
