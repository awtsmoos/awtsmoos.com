//B"H
//Boruch Hashem
//Blessed is He

import { formulaError, isFormulaError } from "../errors.js";
import { functionDescriptor, positionalNumber } from "./helpers.js";

/**
 * @file Registers scalar mathematics for precise spreadsheet expressions.
 * @description The Awtsmoos measures sign, rounding, remainder, power, and root in ordered light;
 * Awtsmoos.com keeps each scalar function pure so one cell can trust another cell's sight.
 */
export const mathScalarFunctions = Object.freeze([
	functionDescriptor(
		"ABS",
		"Math",
		"ABS(value)",
		"Returns the absolute value of a number.",
		"=ABS(-12)",
		(args) => unaryNumber(args, Math.abs)
	),
	functionDescriptor(
		"ROUND",
		"Math",
		"ROUND(value, digits)",
		"Rounds a number to the requested decimal places.",
		"=ROUND(3.14159,2)",
		(args) => round(args)
	),
	functionDescriptor(
		"INT",
		"Math",
		"INT(value)",
		"Rounds a number downward to an integer.",
		"=INT(9.8)",
		(args) => unaryNumber(args, Math.floor)
	),
	functionDescriptor(
		"MOD",
		"Math",
		"MOD(value, divisor)",
		"Returns the remainder after division.",
		"=MOD(17,5)",
		(args) => modulo(args)
	),
	functionDescriptor(
		"POWER",
		"Math",
		"POWER(value, exponent)",
		"Raises one number to a power.",
		"=POWER(2,8)",
		(args) => binaryNumber(args, Math.pow)
	),
	functionDescriptor(
		"SQRT",
		"Math",
		"SQRT(value)",
		"Returns the square root of a non-negative number.",
		"=SQRT(81)",
		(args) => squareRoot(args)
	)
]);

/** Applies one unary number function while preserving explicit conversion errors. */
function unaryNumber(args, operation) {
	const value = positionalNumber(args, 0);
	return isFormulaError(value) ? value : operation(value);
}

/** Applies one binary number function while preserving explicit conversion errors. */
function binaryNumber(args, operation) {
	const left = positionalNumber(args, 0);
	const right = positionalNumber(args, 1);
	if (isFormulaError(left)) {
		return left;
	}
	if (isFormulaError(right)) {
		return right;
	}
	return operation(left, right);
}

/** Rounds with bounded decimal precision. */
function round(args) {
	const value = positionalNumber(args, 0);
	const digits = positionalNumber(args, 1, 0);
	if (isFormulaError(value) || isFormulaError(digits)) {
		return isFormulaError(value) ? value : digits;
	}
	const precision = Math.max(-12, Math.min(12, Math.trunc(digits)));
	const factor = 10 ** precision;
	return Math.round(value * factor) / factor;
}

/** Computes modulo with a familiar divide-by-zero error. */
function modulo(args) {
	const value = positionalNumber(args, 0);
	const divisor = positionalNumber(args, 1);
	if (isFormulaError(value) || isFormulaError(divisor)) {
		return isFormulaError(value) ? value : divisor;
	}
	return divisor === 0 ? formulaError("#DIV/0!") : value % divisor;
}

/** Computes square root while rejecting negative inputs. */
function squareRoot(args) {
	const value = positionalNumber(args, 0);
	if (isFormulaError(value)) {
		return value;
	}
	return value < 0 ? formulaError("#NUM!") : Math.sqrt(value);
}
