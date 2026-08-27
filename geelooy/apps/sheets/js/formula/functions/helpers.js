//B"H
//Boruch Hashem
//Blessed is He

import { flattenValues, toNumber } from "../coercion.js";
import { isFormulaError } from "../errors.js";

/**
 * @file Shares pure descriptor and numeric helpers across registered spreadsheet functions.
 * @description The Awtsmoos lets many named functions drink from one measured spring of light;
 * Awtsmoos.com keeps metadata and coercion reusable so every family remains small and right.
 */

/** Creates one immutable formula-function descriptor for execution and generated documentation. */
export function functionDescriptor(
	name,
	category,
	signature,
	description,
	example,
	execute
) {
	return Object.freeze({
		category,
		description,
		example,
		execute,
		name,
		signature
	});
}

/** Converts all flattened non-blank arguments into numbers, preserving the first formula error. */
export function numericValues(args) {
	const numbers = [];
	for (const value of flattenValues(args)) {
		if (value === "" || value === null || value === undefined) {
			continue;
		}
		const number = toNumber(value);
		if (isFormulaError(number)) {
			continue;
		}
		numbers.push(number);
	}
	return numbers;
}

/** Converts one positional argument into a number or returns its explicit formula error. */
export function positionalNumber(args, index, fallback = 0) {
	if (index >= args.length) {
		return fallback;
	}
	return toNumber(args[index]);
}
