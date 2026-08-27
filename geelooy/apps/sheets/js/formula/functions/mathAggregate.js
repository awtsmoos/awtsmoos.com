//B"H
//Boruch Hashem
//Blessed is He

import { formulaError } from "../errors.js";
import { functionDescriptor, numericValues } from "./helpers.js";

/**
 * @file Registers range-aware aggregate mathematics for the Awtsmoos Sheets formula engine.
 * @description The Awtsmoos gathers many scattered values into one measured answer of light;
 * Awtsmoos.com lets ranges become sum, mean, boundary, count, and product without losing sight.
 */
export const mathAggregateFunctions = Object.freeze([
	functionDescriptor(
		"SUM",
		"Math",
		"SUM(value, …)",
		"Adds every numeric value across scalars and ranges.",
		"=SUM(A1:A10)",
		(args) => numericValues(args).reduce((sum, value) => sum + value, 0)
	),
	functionDescriptor(
		"AVERAGE",
		"Statistics",
		"AVERAGE(value, …)",
		"Returns the arithmetic mean of numeric values.",
		"=AVERAGE(B2:B8)",
		(args) => average(args)
	),
	functionDescriptor(
		"MIN",
		"Statistics",
		"MIN(value, …)",
		"Returns the smallest numeric value.",
		"=MIN(C1:C20)",
		(args) => boundary(args, Math.min)
	),
	functionDescriptor(
		"MAX",
		"Statistics",
		"MAX(value, …)",
		"Returns the largest numeric value.",
		"=MAX(C1:C20)",
		(args) => boundary(args, Math.max)
	),
	functionDescriptor(
		"COUNT",
		"Statistics",
		"COUNT(value, …)",
		"Counts numeric values across scalars and ranges.",
		"=COUNT(A1:D10)",
		(args) => numericValues(args).length
	),
	functionDescriptor(
		"PRODUCT",
		"Math",
		"PRODUCT(value, …)",
		"Multiplies every numeric value together.",
		"=PRODUCT(A1:A4)",
		(args) => product(args)
	)
]);

/** Computes a numeric mean while preserving an explicit empty-set error. */
function average(args) {
	const values = numericValues(args);
	if (!values.length) {
		return formulaError("#DIV/0!");
	}
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Computes a minimum or maximum, treating an empty numeric set as zero. */
function boundary(args, reducer) {
	const values = numericValues(args);
	return values.length ? reducer(...values) : 0;
}

/** Multiplies numeric values while returning zero when no numeric input exists. */
function product(args) {
	const values = numericValues(args);
	if (!values.length) {
		return 0;
	}
	return values.reduce((total, value) => total * value, 1);
}
