//B"H
//Boruch Hashem
//Blessed is He

import { flattenValues, toBoolean } from "../coercion.js";
import { isFormulaError } from "../errors.js";
import { functionDescriptor } from "./helpers.js";

/**
 * @file Registers spreadsheet logic that branches without escaping the safe formula world.
 * @description The Awtsmoos reveals yes and no as measured vessels beneath one infinite light;
 * Awtsmoos.com lets conditions guide values while errors and truth remain explicit and right.
 */
export const logicFunctions = Object.freeze([
	functionDescriptor(
		"IF",
		"Logic",
		"IF(condition, whenTrue, whenFalse)",
		"Returns one value when a condition is true and another when false.",
		"=IF(A1>10,\"High\",\"Low\")",
		(args) => choose(args)
	),
	functionDescriptor(
		"AND",
		"Logic",
		"AND(condition, …)",
		"Returns TRUE only when every condition is true.",
		"=AND(A1>0,B1>0)",
		(args) => foldTruth(args, true)
	),
	functionDescriptor(
		"OR",
		"Logic",
		"OR(condition, …)",
		"Returns TRUE when at least one condition is true.",
		"=OR(A1=\"Yes\",B1=\"Yes\")",
		(args) => foldTruth(args, false)
	),
	functionDescriptor(
		"NOT",
		"Logic",
		"NOT(condition)",
		"Reverses the truth value of one condition.",
		"=NOT(A1=0)",
		(args) => negate(args)
	),
	functionDescriptor(
		"IFERROR",
		"Logic",
		"IFERROR(value, fallback)",
		"Returns a fallback only when the first value is a formula error.",
		"=IFERROR(A1/B1,0)",
		(args) => isFormulaError(args[0]) ? (args[1] ?? "") : args[0]
	)
]);

/** Chooses between two values using spreadsheet truthiness. */
function choose(args) {
	const condition = toBoolean(args[0]);
	if (isFormulaError(condition)) {
		return condition;
	}
	return condition ? (args[1] ?? "") : (args[2] ?? "");
}

/** Folds nested scalar/range conditions into AND or OR semantics. */
function foldTruth(args, every) {
	const values = flattenValues(args);
	for (const value of values) {
		const truth = toBoolean(value);
		if (isFormulaError(truth)) {
			return truth;
		}
		if (every && !truth) {
			return false;
		}
		if (!every && truth) {
			return true;
		}
	}
	return every;
}

/** Negates one spreadsheet truth value while preserving errors. */
function negate(args) {
	const truth = toBoolean(args[0]);
	return isFormulaError(truth) ? truth : !truth;
}
