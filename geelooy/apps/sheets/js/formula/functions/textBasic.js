//B"H
//Boruch Hashem
//Blessed is He

import { flattenValues, toText } from "../coercion.js";
import { isFormulaError } from "../errors.js";
import { functionDescriptor, positionalNumber } from "./helpers.js";

/**
 * @file Registers joining, measuring, and slicing expressions for spreadsheet text.
 * @description The Awtsmoos gathers letters, measures their vessels, and reveals each chosen part in light;
 * Awtsmoos.com lets text flow through formulas without hidden execution, keeping every string path right.
 */
export const textBasicFunctions = Object.freeze([
	functionDescriptor(
		"CONCAT",
		"Text",
		"CONCAT(value, …)",
		"Joins all supplied scalar and range values without a separator.",
		"=CONCAT(A1,B1)",
		(args) => joinValues(args, "")
	),
	functionDescriptor(
		"JOIN",
		"Text",
		"JOIN(separator, value, …)",
		"Joins values using one separator between items.",
		"=JOIN(\", \",A1:A4)",
		(args) => joinWithSeparator(args)
	),
	functionDescriptor(
		"LEN",
		"Text",
		"LEN(value)",
		"Returns the number of characters in text.",
		"=LEN(A1)",
		(args) => lengthOf(args[0])
	),
	functionDescriptor(
		"LEFT",
		"Text",
		"LEFT(value, count)",
		"Returns characters from the left edge of text.",
		"=LEFT(A1,3)",
		(args) => sliceEdge(args, true)
	),
	functionDescriptor(
		"RIGHT",
		"Text",
		"RIGHT(value, count)",
		"Returns characters from the right edge of text.",
		"=RIGHT(A1,3)",
		(args) => sliceEdge(args, false)
	),
	functionDescriptor(
		"MID",
		"Text",
		"MID(value, start, count)",
		"Returns characters from a one-based starting position.",
		"=MID(A1,2,4)",
		(args) => middle(args)
	)
]);

/** Joins flattened values after converting each safely into text. */
function joinValues(args, separator) {
	const values = [];
	for (const value of flattenValues(args)) {
		const converted = toText(value);
		if (isFormulaError(converted)) {
			return converted;
		}
		values.push(converted);
	}
	return values.join(separator);
}

/** Converts the first argument into a separator and joins everything after it. */
function joinWithSeparator(args) {
	const separator = toText(args[0]);
	if (isFormulaError(separator)) {
		return separator;
	}
	return joinValues(args.slice(1), separator);
}

/** Returns text length while preserving explicit errors. */
function lengthOf(value) {
	const converted = toText(value);
	return isFormulaError(converted) ? converted : converted.length;
}

/** Returns a bounded number of characters from the left or right edge. */
function sliceEdge(args, left) {
	const converted = toText(args[0]);
	const count = positionalNumber(args, 1, 1);
	if (isFormulaError(converted)) {
		return converted;
	}
	if (isFormulaError(count)) {
		return count;
	}
	const size = Math.max(0, Math.trunc(count));
	return left ? converted.slice(0, size) : converted.slice(-size);
}

/** Returns a one-based bounded middle slice. */
function middle(args) {
	const converted = toText(args[0]);
	const start = positionalNumber(args, 1, 1);
	const count = positionalNumber(args, 2, 0);
	const error = [converted, start, count].find(isFormulaError);
	if (error) {
		return error;
	}
	const offset = Math.max(0, Math.trunc(start) - 1);
	const size = Math.max(0, Math.trunc(count));
	return converted.slice(offset, offset + size);
}
