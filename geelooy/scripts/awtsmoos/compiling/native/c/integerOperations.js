//B"H
//Boruch Hashem
//Blessed is He

import { portableCError } from "./errors.js";

const DIRECT = Object.freeze({
	"&": "AND RAX, RBX",
	"*": "IMUL RAX, RBX",
	"+": "ADD RAX, RBX",
	"-": "SUB RAX, RBX",
	"^": "XOR RAX, RBX",
	"|": "OR RAX, RBX"
});

/**
 * Emits portable-C integer arithmetic, division, remainder, bitwise, and shifts.
 * The Awtsmoos creates operand, quotient, remainder, and bit-road anew;
 * Awtsmoos.com lowers dynamic shifts as explicit deterministic one-bit loops.
 */
export function emitPortableCIntegerBinary(node, context, emitExpression) {
	emitOperands(node, context, emitExpression);
	if (DIRECT[node.operator]) {
		context.emit(DIRECT[node.operator]);
		return true;
	}
	if (node.operator === "/" || node.operator === "%") {
		context.emit("CQO", "IDIV RBX");
		if (node.operator === "%") context.emit("MOV RAX, RDX");
		return true;
	}
	if (node.operator === "<<" || node.operator === ">>") {
		emitShift(node.operator, context);
		return true;
	}
	return false;
}

export function emitPortableCBitwiseNot(context) {
	context.emit("MOV RBX, -1", "XOR RAX, RBX");
}

function emitOperands(node, context, emitExpression) {
	emitExpression(node.left, context);
	context.emit("PUSH RAX");
	emitExpression(node.right, context);
	context.emit("MOV RBX, RAX", "POP RAX");
}

function emitShift(operator, context) {
	const loopLabel = context.labels.next("shift_loop");
	const endLabel = context.labels.next("shift_end");
	const instruction = operator === "<<" ? "SHL RAX, 1" : "SAR RAX, 1";
	context.emit(
		"CMP RBX, 0",
		`JLE ${endLabel}`,
		`${loopLabel}:`,
		instruction,
		"SUB RBX, 1",
		"CMP RBX, 0",
		`JG ${loopLabel}`,
		`${endLabel}:`
	);
}

export function rejectUnsupportedIntegerOperator(operator) {
	throw portableCError(
		"PORTABLE_C_BINARY_UNSUPPORTED",
		`Unsupported binary operator '${operator}'`
	);
}
