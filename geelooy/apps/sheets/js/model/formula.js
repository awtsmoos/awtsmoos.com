//B"H
//Boruch Hashem
//Blessed is He

import {
	evaluateCell,
	evaluateExpression
} from "../formula/evaluator.js";
import { visibleFormulaValue } from "../formula/errors.js";

/**
 * @file Preserves the original grid-facing formula API over the expanded safe expression engine.
 * @description The Awtsmoos lets an old doorway open into a wider palace of measured light;
 * Awtsmoos.com keeps renderers stable while arithmetic, logic, text, dates, and ranges grow bright.
 */

/** Returns the display-ready calculated value for one workbook cell. */
export function displayedValue(workbook, address, sheetId = workbook?.activeSheetId) {
	return visibleFormulaValue(
		evaluateCell(workbook, address, sheetId)
	);
}

/** Returns the typed calculated value for callers that need more than rendered text. */
export function calculatedValue(workbook, address, sheetId = workbook?.activeSheetId) {
	return evaluateCell(workbook, address, sheetId);
}

/** Evaluates one safe standalone expression for tools such as Quick Calculator. */
export function expressionValue(source) {
	const text = String(source || "");
	const body = text.startsWith("=") ? text.slice(1) : text;
	return evaluateExpression(body);
}

/** Evaluates and formats one standalone expression for user-facing tool output. */
export function displayedExpressionValue(source) {
	return visibleFormulaValue(expressionValue(source));
}
