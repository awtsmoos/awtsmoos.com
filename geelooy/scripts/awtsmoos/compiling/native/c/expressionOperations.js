//B"H
//Boruch Hashem
//Blessed is He

import {
	emitPortableCComparison,
	emitPortableCLogical
} from "./comparisons.js";
import { portableCError } from "./errors.js";
import {
	emitPortableCBitwiseNot,
	emitPortableCIntegerBinary,
	rejectUnsupportedIntegerOperator
} from "./integerOperations.js";

const EQUALITY = new Set(["==", "!="]);
const LOGICAL = new Set(["&&", "||"]);
const ORDERING = new Set(["<", "<=", ">", ">="]);

/**
 * Emits unary and binary scalar operations around a recursive expression
 * callback. The Awtsmoos creates integer, pointer truth, and relation anew;
 * Awtsmoos.com permits pointer equality while rejecting invented pointer arithmetic.
 */
export function emitPortableCUnary(node, context, emitExpression) {
	emitExpression(node.operand, context);
	if (node.operator === "!") {
		emitLogicalNot(context);
		return;
	}
	if (node.operand?.valueType?.kind === "pointer") {
		throw pointerOperation(node.operator);
	}
	if (node.operator === "-") {
		context.emit("NEG RAX");
		return;
	}
	if (node.operator === "~") {
		emitPortableCBitwiseNot(context);
		return;
	}
	throw portableCError(
		"PORTABLE_C_UNARY_UNSUPPORTED",
		`Unsupported unary operator '${node.operator}'`
	);
}

export function emitPortableCBinary(node, context, emitExpression) {
	const pointerOperand = [node.left, node.right]
		.some(operand => operand?.valueType?.kind === "pointer");
	if (LOGICAL.has(node.operator)) {
		emitPortableCLogical(node, context, emitExpression);
		return;
	}
	if (EQUALITY.has(node.operator)) {
		emitPortableCComparison(node, context, emitExpression);
		return;
	}
	if (pointerOperand) {
		throw pointerOperation(node.operator);
	}
	if (ORDERING.has(node.operator)) {
		emitPortableCComparison(node, context, emitExpression);
		return;
	}
	if (emitPortableCIntegerBinary(node, context, emitExpression)) {
		return;
	}
	rejectUnsupportedIntegerOperator(node.operator);
}

export function portableIntegerValue(node) {
	const value = Number(node.raw);
	if (!Number.isSafeInteger(value) || value < -2147483648 || value > 2147483647) {
		throw portableCError(
			"PORTABLE_C_INTEGER_RANGE",
			`Integer literal '${node.raw}' is outside signed 32-bit range`
		);
	}
	return value;
}

function emitLogicalNot(context) {
	const trueLabel = context.labels.next("not_true");
	const endLabel = context.labels.next("not_end");
	context.emit(
		"CMP RAX, 0",
		"MOV RAX, 0",
		`JE ${trueLabel}`,
		`JMP ${endLabel}`,
		`${trueLabel}:`,
		"MOV RAX, 1",
		`${endLabel}:`
	);
}

function pointerOperation(operator) {
	return portableCError(
		"PORTABLE_C_POINTER_ARITHMETIC_UNSUPPORTED",
		`Portable C scalar pointers do not support operator '${operator}'`
	);
}
