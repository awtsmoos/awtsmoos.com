//B"H
//Boruch Hashem
//Blessed is He

import { toNumber, toText } from "./coercion.js";
import { formulaError, isFormulaError } from "./errors.js";

/**
 * @file Executes safe spreadsheet unary and binary operators without invoking JavaScript source.
 * @description The Awtsmoos joins number, comparison, and text through measured channels of light;
 * Awtsmoos.com keeps operator meaning explicit so formulas never escape into arbitrary execution at night.
 */

/** Evaluates one unary plus or minus expression. */
export function evaluateUnary(operator, value) {
	if (isFormulaError(value)) {
		return value;
	}
	const number = toNumber(value);
	if (isFormulaError(number)) {
		return number;
	}
	return operator === "-" ? -number : number;
}

/** Evaluates one safe binary operator across already-resolved operands. */
export function evaluateBinary(operator, left, right) {
	if (isFormulaError(left)) {
		return left;
	}
	if (isFormulaError(right)) {
		return right;
	}
	if (operator === "&") {
		return concatenate(left, right);
	}
	if (["=", "<>", "<", "<=", ">", ">="].includes(operator)) {
		return compare(operator, left, right);
	}
	return arithmetic(operator, left, right);
}

/** Evaluates arithmetic after centralized numeric coercion. */
function arithmetic(operator, left, right) {
	const leftNumber = toNumber(left);
	const rightNumber = toNumber(right);
	if (isFormulaError(leftNumber)) {
		return leftNumber;
	}
	if (isFormulaError(rightNumber)) {
		return rightNumber;
	}
	if ((operator === "/" || operator === "%") && rightNumber === 0) {
		return formulaError("#DIV/0!");
	}
	if (operator === "+") {
		return leftNumber + rightNumber;
	}
	if (operator === "-") {
		return leftNumber - rightNumber;
	}
	if (operator === "*") {
		return leftNumber * rightNumber;
	}
	if (operator === "/") {
		return leftNumber / rightNumber;
	}
	if (operator === "%") {
		return leftNumber % rightNumber;
	}
	if (operator === "^") {
		return leftNumber ** rightNumber;
	}
	return formulaError("#OP!");
}

/** Concatenates two safe text scalars. */
function concatenate(left, right) {
	const leftText = toText(left);
	const rightText = toText(right);
	if (isFormulaError(leftText)) {
		return leftText;
	}
	if (isFormulaError(rightText)) {
		return rightText;
	}
	return leftText + rightText;
}

/** Compares numeric pairs numerically and all other pairs as normalized text. */
function compare(operator, left, right) {
	const leftNumber = numericOrNull(left);
	const rightNumber = numericOrNull(right);
	const numeric = leftNumber !== null && rightNumber !== null;
	const first = numeric ? leftNumber : String(left).toLowerCase();
	const second = numeric ? rightNumber : String(right).toLowerCase();
	if (operator === "=") {
		return first === second;
	}
	if (operator === "<>") {
		return first !== second;
	}
	if (operator === "<") {
		return first < second;
	}
	if (operator === "<=") {
		return first <= second;
	}
	if (operator === ">") {
		return first > second;
	}
	return first >= second;
}

/** Returns a finite numeric interpretation or null when text should compare textually. */
function numericOrNull(value) {
	if (value === "" || value === null || value === undefined) {
		return 0;
	}
	const number = Number(value);
	return Number.isFinite(number) ? number : null;
}
