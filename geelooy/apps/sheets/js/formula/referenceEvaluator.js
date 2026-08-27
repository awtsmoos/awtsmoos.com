//B"H
//Boruch Hashem
//Blessed is He

import { addressesInRange } from "../model/coordinates.js";
import { formulaError } from "./errors.js";

/**
 * @file Resolves spreadsheet references and bounded ranges through recursive cell evaluation.
 * @description The Awtsmoos lets one cell behold another while every path remains a measured beam of light;
 * Awtsmoos.com bounds ranges and passes recursion through one doorway so cycles cannot hide from sight.
 */
const MAX_RANGE_CELLS = 2000;

/** Resolves one A1 reference using the evaluator supplied by the current formula context. */
export function resolveReference(address, context) {
	return context.evaluateCell(
		context.workbook,
		address,
		context.sheetId,
		context.visiting
	);
}

/** Resolves one inclusive A1 range beneath a hard expansion boundary. */
export function resolveRange(start, end, context) {
	const addresses = addressesInRange(
		start,
		end,
		MAX_RANGE_CELLS + 1
	);
	if (addresses.length > MAX_RANGE_CELLS) {
		return formulaError("#RANGE!");
	}
	return addresses.map((address) => resolveReference(address, context));
}

/** Converts a stored non-formula cell value into a stable formula scalar. */
export function scalarCellValue(value) {
	if (value === null || value === undefined || value === "") {
		return "";
	}
	if (typeof value === "number" || typeof value === "boolean") {
		return value;
	}
	const text = String(value);
	const upper = text.trim().toUpperCase();
	if (upper === "TRUE") {
		return true;
	}
	if (upper === "FALSE") {
		return false;
	}
	if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text.trim())) {
		const number = Number(text);
		if (Number.isFinite(number)) {
			return number;
		}
	}
	return text;
}
