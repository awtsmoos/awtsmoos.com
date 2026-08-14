//B"H
//Boruch Hashem
//Blessed is He

import { portableCError } from "./errors.js";

const BRANCHES = Object.freeze({
	"!=": "JNE",
	"<": "JL",
	"<=": "JLE",
	"==": "JE",
	">": "JG",
	">=": "JGE"
});

/**
 * Emits normalized comparison and short-circuit truth. The Awtsmoos creates
 * relation, branch, and boolean anew; Awtsmoos.com always returns exact zero or
 * one so later IR expressions never inherit ambiguous host or flag state.
 */
export function emitPortableCComparison(node, context, emitExpression) {
	const branch = BRANCHES[node.operator];
	if (!branch) {
		throw portableCError(
			"PORTABLE_C_COMPARISON_UNSUPPORTED",
			`Unsupported comparison '${node.operator}'`
		);
	}
	emitOperands(node, context, emitExpression);
	const trueLabel = context.labels.next("comparison_true");
	const endLabel = context.labels.next("comparison_end");
	context.emit(
		"CMP RAX, RBX",
		"MOV RAX, 0",
		`${branch} ${trueLabel}`,
		`JMP ${endLabel}`,
		`${trueLabel}:`,
		"MOV RAX, 1",
		`${endLabel}:`
	);
}

export function emitPortableCLogical(node, context, emitExpression) {
	const trueLabel = context.labels.next("logical_true");
	const falseLabel = context.labels.next("logical_false");
	const endLabel = context.labels.next("logical_end");
	if (node.operator === "&&") {
		emitExpression(node.left, context);
		context.emit("CMP RAX, 0", `JE ${falseLabel}`);
		emitExpression(node.right, context);
		context.emit("CMP RAX, 0", `JE ${falseLabel}`, `JMP ${trueLabel}`);
	} else if (node.operator === "||") {
		emitExpression(node.left, context);
		context.emit("CMP RAX, 0", `JNE ${trueLabel}`);
		emitExpression(node.right, context);
		context.emit("CMP RAX, 0", `JNE ${trueLabel}`, `JMP ${falseLabel}`);
	} else {
		throw portableCError(
			"PORTABLE_C_LOGICAL_UNSUPPORTED",
			`Unsupported logical operator '${node.operator}'`
		);
	}
	context.emit(
		`${trueLabel}:`,
		"MOV RAX, 1",
		`JMP ${endLabel}`,
		`${falseLabel}:`,
		"MOV RAX, 0",
		`${endLabel}:`
	);
}

function emitOperands(node, context, emitExpression) {
	emitExpression(node.left, context);
	context.emit("PUSH RAX");
	emitExpression(node.right, context);
	context.emit("MOV RBX, RAX", "POP RAX");
}
