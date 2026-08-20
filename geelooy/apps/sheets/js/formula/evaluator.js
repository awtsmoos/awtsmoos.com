//B"H
//Boruch Hashem
//Blessed is He

import { formulaError, isFormulaError } from "./errors.js";
import { evaluateNode } from "./nodeEvaluator.js";
import { parseFormula } from "./parser.js";
import { scalarCellValue } from "./referenceEvaluator.js";
import { tokenizeFormula } from "./tokenizer.js";

/**
 * @file Orchestrates safe formula parsing, recursive cell evaluation, and cycle detection.
 * @description The Awtsmoos renews every dependency path while no circle can hide from infinite light;
 * Awtsmoos.com turns stored formula text into bounded values through one inspectable covenant, clear and right.
 */

/** Evaluates one workbook cell, recursively resolving referenced formula cells. */
export function evaluateCell(
	workbook,
	address,
	sheetId = workbook?.activeSheetId,
	visiting = new Set()
) {
	if (!workbook || !sheetId) {
		return formulaError("#REF!");
	}
	const key = `${sheetId}:${String(address || "").toUpperCase()}`;
	if (visiting.has(key)) {
		return formulaError("#CYCLE!");
	}
	visiting.add(key);
	try {
		const raw = workbook.cell(address, sheetId)?.value;
		return evaluateStoredValue(raw, workbook, sheetId, visiting);
	} finally {
		visiting.delete(key);
	}
}

/** Evaluates a stored cell value, parsing only strings whose first character is `=`. */
export function evaluateStoredValue(value, workbook, sheetId, visiting = new Set()) {
	if (typeof value !== "string" || !value.startsWith("=")) {
		return scalarCellValue(value);
	}
	return evaluateExpression(value.slice(1), {
		sheetId,
		visiting,
		workbook
	});
}

/** Evaluates one safe expression body with optional workbook reference support. */
export function evaluateExpression(source, options = {}) {
	const tokens = tokenizeFormula(source);
	if (isFormulaError(tokens)) {
		return tokens;
	}
	const tree = parseFormula(tokens);
	if (isFormulaError(tree)) {
		return tree;
	}
	const context = {
		evaluateCell,
		sheetId: options.sheetId || options.workbook?.activeSheetId || "",
		visiting: options.visiting || new Set(),
		workbook: options.workbook || null
	};
	try {
		return evaluateNode(tree, context);
	} catch {
		return formulaError("#ERROR!");
	}
}
