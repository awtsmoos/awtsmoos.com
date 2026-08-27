//B"H
//Boruch Hashem
//Blessed is He

import { flattenValues } from "../coercion.js";
import { formulaError, isFormulaError } from "../errors.js";
import { functionDescriptor, positionalNumber } from "./helpers.js";

/**
 * @file Registers practical lookup/reference functions shared by Excel and Google Sheets.
 * @description The Awtsmoos lets one value seek its echo through ordered ranges of light;
 * Awtsmoos.com keeps lookup direction, exactness, and return paths explicit, bounded, and right.
 */
export const lookupFunctions = Object.freeze([
	functionDescriptor("INDEX", "Lookup", "INDEX(reference,row,column)", "Returns an item from a range by position.", "=INDEX(A1:C5,2,3)", (args) => indexValue(args)),
	functionDescriptor("MATCH", "Lookup", "MATCH(value,range,matchType)", "Returns a one-based match position.", "=MATCH(A1,B1:B20,0)", (args) => matchCall(args)),
	functionDescriptor("XMATCH", "Lookup", "XMATCH(value,range)", "Returns an exact one-based match position.", "=XMATCH(A1,B1:B20)", (args) => exactMatch(args[0], args[1])),
	functionDescriptor("XLOOKUP", "Lookup", "XLOOKUP(value,lookup,return,notFound)", "Returns an aligned exact lookup value.", "=XLOOKUP(A1,B1:B20,C1:C20)", (args) => xlookup(args)),
	functionDescriptor("VLOOKUP", "Lookup", "VLOOKUP(value,table,column,sorted)", "Looks down the first table column and returns an aligned column.", "=VLOOKUP(A1,B1:E20,3,FALSE)", (args) => vlookup(args)),
	functionDescriptor("HLOOKUP", "Lookup", "HLOOKUP(value,table,row,sorted)", "Looks across the first table row and returns an aligned row.", "=HLOOKUP(A1,B1:E5,3,FALSE)", (args) => hlookup(args)),
	functionDescriptor("CHOOSE", "Lookup", "CHOOSE(index,value1,…)", "Returns one positional value from a list.", "=CHOOSE(2,A1,B1,C1)", (args) => choose(args))
]);

/** Returns one positional item from a flattened or two-dimensional range. */
function indexValue(args) {
	const source = args[0];
	const row = positionalNumber(args, 1, 1);
	const column = positionalNumber(args, 2, 1);
	const error = [row, column].find(isFormulaError);
	if (error) return error;
	if (Array.isArray(source) && Array.isArray(source[0])) {
		return source[Math.trunc(row) - 1]?.[Math.trunc(column) - 1] ?? formulaError("#REF!");
	}
	const values = flattenValues([source]);
	const offset = Math.trunc(row) - 1;
	return values[offset] ?? formulaError("#REF!");
}

/** Implements exact, ascending-approximate, or descending-approximate MATCH. */
function matchCall(args) {
	const type = positionalNumber(args, 2, 1);
	if (isFormulaError(type)) return type;
	const values = flattenValues([args[1]]);
	if (type === 0) return exactMatch(args[0], values);
	return approximateMatch(args[0], values, type < 0);
}

/** Returns one exact one-based match position. */
function exactMatch(needle, source) {
	const values = flattenValues([source]);
	const index = values.findIndex((value) => compare(value, needle) === 0);
	return index < 0 ? formulaError("#N/A") : index + 1;
}

/** Returns one approximate one-based match position. */
function approximateMatch(needle, values, descending) {
	let best = -1;
	for (let index = 0; index < values.length; index += 1) {
		const relation = compare(values[index], needle);
		if ((!descending && relation <= 0) || (descending && relation >= 0)) best = index;
	}
	return best < 0 ? formulaError("#N/A") : best + 1;
}

/** Returns an aligned exact-match value with optional not-found fallback. */
function xlookup(args) {
	const lookup = flattenValues([args[1]]);
	const returns = flattenValues([args[2]]);
	const index = lookup.findIndex((value) => compare(value, args[0]) === 0);
	return index < 0 ? (args[3] ?? formulaError("#N/A")) : (returns[index] ?? formulaError("#N/A"));
}

/** Implements exact-first-column VLOOKUP over a rectangular nested array. */
function vlookup(args) {
	const table = rectangular(args[1]);
	const column = positionalNumber(args, 2);
	if (isFormulaError(column)) return column;
	const row = table.find((values) => compare(values[0], args[0]) === 0);
	return row?.[Math.trunc(column) - 1] ?? formulaError("#N/A");
}

/** Implements exact-first-row HLOOKUP over a rectangular nested array. */
function hlookup(args) {
	const table = rectangular(args[1]);
	const rowNumber = positionalNumber(args, 2);
	if (isFormulaError(rowNumber) || !table.length) return isFormulaError(rowNumber) ? rowNumber : formulaError("#N/A");
	const column = table[0].findIndex((value) => compare(value, args[0]) === 0);
	return column < 0 ? formulaError("#N/A") : (table[Math.trunc(rowNumber) - 1]?.[column] ?? formulaError("#N/A"));
}

/** Returns one positional argument after a one-based index. */
function choose(args) {
	const index = positionalNumber(args, 0);
	return isFormulaError(index) ? index : (args[Math.trunc(index)] ?? formulaError("#VALUE!"));
}

/** Normalizes scalar/flat/nested arrays into a nested rectangular-ish structure. */
function rectangular(value) {
	if (!Array.isArray(value)) return [[value]];
	if (Array.isArray(value[0])) return value;
	return value.map((item) => [item]);
}

/** Compares values numerically when possible and case-insensitively otherwise. */
function compare(left, right) {
	const leftNumber = Number(left);
	const rightNumber = Number(right);
	if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) return Math.sign(leftNumber - rightNumber);
	return String(left ?? "").toLowerCase().localeCompare(String(right ?? "").toLowerCase());
}
