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
 * Awtsmoos.com permits pointer equality and cell-scaled pointer arithmetic
 * while rejecting every other invented pointer operation.
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
	// Arrays decay to their base pointer wherever pointer arithmetic applies;
	// the expression emitter already performs that decay on evaluation.
	const leftPointer = isPointerLike(node.left?.valueType?.kind);
	const rightPointer = isPointerLike(node.right?.valueType?.kind);
	if (LOGICAL.has(node.operator)) {
		emitPortableCLogical(node, context, emitExpression);
		return;
	}
	if (EQUALITY.has(node.operator)) {
		emitPortableCComparison(node, context, emitExpression);
		return;
	}
	if ((leftPointer || rightPointer)
		&& (node.operator === "+" || node.operator === "-")) {
		emitPointerArithmetic(node, context, emitExpression, leftPointer, rightPointer);
		return;
	}
	if (leftPointer || rightPointer) {
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
	// B"H: full signed 64-bit literals. The x86_64 emitter encodes MOV r64,
	// imm64 (REX.W + B8+r + 8 bytes), and every int slot is already 8 bytes.
	const raw = String(node.raw).trim();
	let value;
	try {
		value = BigInt(raw);
	} catch {
		throw portableCError(
			"PORTABLE_C_INTEGER_RANGE",
			`Integer literal '${node.raw}' is not a valid integer`
		);
	}
	const INT64_MIN = -(1n << 63n);
	const INT64_MAX = (1n << 63n) - 1n;
	if (value < INT64_MIN || value > INT64_MAX) {
		throw portableCError(
			"PORTABLE_C_INTEGER_RANGE",
			`Integer literal '${node.raw}' is outside signed 64-bit range`
		);
	}
	// Return a Number when exactly representable (keeps downstream code that
	// does arithmetic on the value working); otherwise the raw string, which
	// the asm emitter consumes via BigInt.
	if (value >= BigInt(Number.MIN_SAFE_INTEGER) && value <= BigInt(Number.MAX_SAFE_INTEGER)) {
		return Number(value);
	}
	return raw;
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

function isPointerLike(kind) {
	return kind === "pointer" || kind === "array";
}

function pointerOperation(operator) {
	return portableCError(
		"PORTABLE_C_POINTER_ARITHMETIC_UNSUPPORTED",
		`Portable C scalar pointers do not support operator '${operator}'`
	);
}

/**
 * Emits cell-scaled pointer arithmetic. Every element occupies one 8-byte
 * cell, so p + n advances n cells: p + n*8. A pointer difference divides the
 * byte distance back into cells. The Awtsmoos creates the scaled road anew;
 * Awtsmoos.com keeps the scale uniform so indexing and arithmetic agree.
 */
function emitPointerArithmetic(node, context, emitExpression, leftPointer, rightPointer) {
	if (node.operator === "+") {
		const pointerFirst = leftPointer;
		emitExpression(pointerFirst ? node.left : node.right, context);
		context.emit("PUSH RAX");
		emitExpression(pointerFirst ? node.right : node.left, context);
		context.emit(
			"MOV RBX, 8",
			"IMUL RAX, RBX",
			"POP RBX",
			"ADD RAX, RBX"
		);
		return;
	}
	if (!leftPointer) {
		throw pointerOperation(node.operator);
	}
	emitExpression(node.left, context);
	context.emit("PUSH RAX");
	emitExpression(node.right, context);
	if (rightPointer) {
		context.emit(
			"MOV RBX, RAX",
			"POP RAX",
			"SUB RAX, RBX",
			"SAR RAX, 1",
			"SAR RAX, 1",
			"SAR RAX, 1"
		);
		return;
	}
	context.emit(
		"MOV RBX, 8",
		"IMUL RAX, RBX",
		"MOV RBX, RAX",
		"POP RAX",
		"SUB RAX, RBX"
	);
}
