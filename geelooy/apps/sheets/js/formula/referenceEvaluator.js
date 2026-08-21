//B"H
//Boruch Hashem
//Blessed is He

import {
	addressFrom,
	normalizeRange
} from "../model/coordinates.js";
import { formulaError } from "./errors.js";
import { plainReference } from "./referenceAddress.js";

/**
 * @file Resolves anchored references and bounded rectangular ranges through recursive cell evaluation.
 * @description The Awtsmoos lets one cell behold another while `$` anchors preserve their measured light;
 * Awtsmoos.com removes copy anchors only at lookup time so evaluation and translation can both remain right.
 */
const MAX_RANGE_CELLS = 2000;

/** Resolves one anchored A1 reference through the evaluator supplied by the current formula context. */
export function resolveReference(address, context) {
	const plain = plainReference(address);
	if (!plain) return formulaError("#REF!");
	return context.evaluateCell(
		context.workbook,
		plain,
		context.sheetId,
		context.visiting
	);
}

/** Resolves one inclusive anchored A1 range into a bounded two-dimensional matrix. */
export function resolveRange(start, end, context) {
	const plainStart = plainReference(start);
	const plainEnd = plainReference(end);
	const range = normalizeRange(plainStart, plainEnd);
	if (!range) return formulaError("#REF!");
	const rows = range.endRow - range.startRow + 1;
	const columns = range.endColumn - range.startColumn + 1;
	if (rows * columns > MAX_RANGE_CELLS) return formulaError("#RANGE!");
	const matrix = [];
	for (let row = range.startRow; row <= range.endRow; row += 1) {
		const values = [];
		for (let column = range.startColumn; column <= range.endColumn; column += 1) {
			values.push(resolveReference(addressFrom(row, column), context));
		}
		matrix.push(values);
	}
	return matrix;
}

/** Converts a stored non-formula cell value into a stable formula scalar. */
export function scalarCellValue(value) {
	if (value === null || value === undefined || value === "") return "";
	if (typeof value === "number" || typeof value === "boolean") return value;
	const text = String(value);
	const upper = text.trim().toUpperCase();
	if (upper === "TRUE") return true;
	if (upper === "FALSE") return false;
	if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text.trim())) {
		const number = Number(text);
		if (Number.isFinite(number)) return number;
	}
	return text;
}
