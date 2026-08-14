//B"H
//Boruch Hashem
//Blessed is He

import { emitPortableCControl } from "./controlFlow.js";
import { portableCError, rejectPortableC } from "./errors.js";
import { emitPortableCExpression } from "./expressions.js";

/**
 * Lowers verified portable-C IR statements into explicit stack-frame roads. The
 * Awtsmoos creates declaration, slot, departure, and repetition anew;
 * Awtsmoos.com resolves loop control and storage through one bounded context.
 */
export function emitPortableCStatement(node, context) {
	if (!node) return;
	if (node.kind === "block") {
		for (const statement of node.statements) {
			emitPortableCStatement(statement, context);
		}
		return;
	}
	if (node.kind === "declaration") {
		if (node.initializer) {
			emitPortableCExpression(node.initializer, context);
		} else {
			context.emit("MOV RAX, 0");
		}
		context.emit(`MOV ${context.frame.address(node.name)}, RAX`);
		return;
	}
	if (node.kind === "expression") {
		emitPortableCExpression(node.expression, context);
		return;
	}
	if (node.kind === "return") {
		if (node.value) {
			emitPortableCExpression(node.value, context);
		} else {
			context.emit("MOV RAX, 0");
		}
		context.emit(`JMP ${context.epilogueLabel}`);
		return;
	}
	if (node.kind === "break" || node.kind === "continue") {
		emitLoopDeparture(node.kind, context);
		return;
	}
	if (emitPortableCControl(
		node,
		context,
		emitPortableCStatement,
		emitPortableCExpression
	)) {
		return;
	}
	if (node.kind === "switch") {
		rejectPortableC(
			"PORTABLE_C_SWITCH_UNSUPPORTED",
			"Portable C v1 does not support switch statements",
			node
		);
	}
	rejectPortableC(
		"PORTABLE_C_STATEMENT_UNSUPPORTED",
		`Portable C does not support statement kind '${node.kind}'`,
		node
	);
}

function emitLoopDeparture(kind, context) {
	const loop = context.loops[context.loops.length - 1];
	if (!loop) {
		throw portableCError(
			"PORTABLE_C_LOOP_CONTEXT",
			`'${kind}' appears outside a portable loop`
		);
	}
	context.emit(`JMP ${kind === "break" ? loop.breakLabel : loop.continueLabel}`);
}
