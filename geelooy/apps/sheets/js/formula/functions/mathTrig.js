//B"H
//Boruch Hashem
//Blessed is He

import { formulaError, isFormulaError } from "../errors.js";
import { functionDescriptor, positionalNumber } from "./helpers.js";

/**
 * @file Registers deterministic trigonometric and logarithmic spreadsheet functions.
 * @description The Awtsmoos bends angle, ratio, exponent, and logarithm through measured laws of light;
 * Awtsmoos.com maps familiar Excel and Sheets names into pure mathematics, bounded and right.
 */
export const mathTrigFunctions = Object.freeze([
	unary("ACOS", Math.acos),
	unary("ACOSH", Math.acosh),
	unary("ASIN", Math.asin),
	unary("ASINH", Math.asinh),
	unary("ATAN", Math.atan),
	unary("ATANH", Math.atanh),
	unary("COS", Math.cos),
	unary("COSH", Math.cosh),
	unary("SIN", Math.sin),
	unary("SINH", Math.sinh),
	unary("TAN", Math.tan),
	unary("TANH", Math.tanh),
	unary("EXP", Math.exp),
	unary("LN", Math.log),
	unary("LOG10", Math.log10),
	unary("DEGREES", (value) => value * 180 / Math.PI),
	unary("RADIANS", (value) => value * Math.PI / 180),
	functionDescriptor("PI", "Math", "PI()", "Returns pi.", "=PI()", () => Math.PI),
	functionDescriptor("ATAN2", "Math", "ATAN2(x,y)", "Returns an angle from x/y coordinates.", "=ATAN2(1,1)", (args) => binary(args, Math.atan2)),
	functionDescriptor("LOG", "Math", "LOG(value,base)", "Returns a logarithm at the requested base.", "=LOG(8,2)", logarithm),
	functionDescriptor("SIGN", "Math", "SIGN(value)", "Returns -1, 0, or 1 for a number.", "=SIGN(A1)", (args) => numericUnary(args, Math.sign)),
	functionDescriptor("RAND", "Math", "RAND()", "Returns a pseudo-random number from 0 to 1.", "=RAND()", () => Math.random()),
	functionDescriptor("RANDBETWEEN", "Math", "RANDBETWEEN(low,high)", "Returns a pseudo-random integer in a range.", "=RANDBETWEEN(1,10)", randomBetween),
	functionDescriptor("COT", "Math", "COT(value)", "Returns the cotangent of an angle.", "=COT(A1)", (args) => reciprocalTrig(args, Math.tan)),
	functionDescriptor("SEC", "Math", "SEC(value)", "Returns the secant of an angle.", "=SEC(A1)", (args) => reciprocalTrig(args, Math.cos)),
	functionDescriptor("CSC", "Math", "CSC(value)", "Returns the cosecant of an angle.", "=CSC(A1)", (args) => reciprocalTrig(args, Math.sin))
]);

/** Creates a standard unary numeric descriptor. */
function unary(name, operation) {
	return functionDescriptor(
		name,
		"Math",
		`${name}(value)`,
		`Returns ${name.toLowerCase()} of a number.`,
		`=${name}(1)`,
		(args) => numericUnary(args, operation)
	);
}

/** Applies one unary numeric operation with explicit errors for invalid results. */
function numericUnary(args, operation) {
	const value = positionalNumber(args, 0);
	if (isFormulaError(value)) return value;
	const result = operation(value);
	return Number.isFinite(result) ? result : formulaError("#NUM!");
}

/** Applies one binary numeric operation. */
function binary(args, operation) {
	const left = positionalNumber(args, 0);
	const right = positionalNumber(args, 1);
	const error = [left, right].find(isFormulaError);
	if (error) return error;
	const result = operation(left, right);
	return Number.isFinite(result) ? result : formulaError("#NUM!");
}

/** Computes logarithm at one positive base. */
function logarithm(args) {
	const value = positionalNumber(args, 0);
	const base = positionalNumber(args, 1, 10);
	if (isFormulaError(value) || isFormulaError(base)) {
		return isFormulaError(value) ? value : base;
	}
	if (value <= 0 || base <= 0 || base === 1) return formulaError("#NUM!");
	return Math.log(value) / Math.log(base);
}

/** Returns one inclusive pseudo-random integer between normalized endpoints. */
function randomBetween(args) {
	const low = positionalNumber(args, 0);
	const high = positionalNumber(args, 1);
	const error = [low, high].find(isFormulaError);
	if (error) return error;
	const start = Math.ceil(Math.min(low, high));
	const end = Math.floor(Math.max(low, high));
	return Math.floor(Math.random() * (end - start + 1)) + start;
}

/** Computes reciprocal trigonometric functions while guarding zero denominators. */
function reciprocalTrig(args, operation) {
	const value = positionalNumber(args, 0);
	if (isFormulaError(value)) return value;
	const denominator = operation(value);
	return denominator === 0 ? formulaError("#DIV/0!") : 1 / denominator;
}
