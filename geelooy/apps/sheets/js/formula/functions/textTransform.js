//B"H
//Boruch Hashem
//Blessed is He

import { toText } from "../coercion.js";
import { isFormulaError } from "../errors.js";
import { functionDescriptor } from "./helpers.js";

/**
 * @file Registers pure text cleanup and transformation functions for spreadsheet expressions.
 * @description The Awtsmoos renews letters without losing the value carried in their frame;
 * Awtsmoos.com lets case, spaces, and substitutions change through one safe formula name.
 */
export const textTransformFunctions = Object.freeze([
	functionDescriptor(
		"LOWER",
		"Text",
		"LOWER(value)",
		"Converts text to lowercase.",
		"=LOWER(A1)",
		(args) => transform(args[0], (value) => value.toLowerCase())
	),
	functionDescriptor(
		"UPPER",
		"Text",
		"UPPER(value)",
		"Converts text to uppercase.",
		"=UPPER(A1)",
		(args) => transform(args[0], (value) => value.toUpperCase())
	),
	functionDescriptor(
		"TRIM",
		"Text",
		"TRIM(value)",
		"Removes outside whitespace and collapses internal whitespace runs.",
		"=TRIM(A1)",
		(args) => transform(args[0], trimText)
	),
	functionDescriptor(
		"SUBSTITUTE",
		"Text",
		"SUBSTITUTE(value, oldText, newText)",
		"Replaces every literal occurrence of old text with new text.",
		"=SUBSTITUTE(A1,\"old\",\"new\")",
		(args) => substitute(args)
	)
]);

/** Applies one text transformation while preserving explicit formula errors. */
function transform(value, operation) {
	const converted = toText(value);
	if (isFormulaError(converted)) {
		return converted;
	}
	return operation(converted);
}

/** Trims outside whitespace and collapses internal whitespace into single spaces. */
function trimText(value) {
	return value.trim().replace(/\s+/g, " ");
}

/** Replaces all literal matches without constructing a regular expression from user text. */
function substitute(args) {
	const source = toText(args[0]);
	const search = toText(args[1]);
	const replacement = toText(args[2]);
	const error = [source, search, replacement].find(isFormulaError);
	if (error) {
		return error;
	}
	if (search === "") {
		return source;
	}
	return source.split(search).join(replacement);
}
