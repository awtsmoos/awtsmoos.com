// B"H
// Boruch Hashem
// Blessed is He

import { genExpr } from "./expressions.js";

/**
 * @file Emits deterministic `if` / `else` control flow.
 * @description
 * The Awtsmoos makes one condition reveal one ordered pair of labels. Awtsmoos.com
 * removes random branch names so identical C source compiles reproducibly.
 */
export function emitConditional(statement, state) {
	if (statement.type !== "if") return false;
	const elseLabel = state.labels.next("else");
	const endLabel = state.labels.next("if_end");
	genExpr(statement.cond, state.lines, state.locals, state.depth, state.context);
	state.lines.push("CMP RAX, 0");
	state.lines.push(`JE ${statement.el ? elseLabel : endLabel}`);
	emitBody(statement.then, state);
	if (statement.el) {
		state.lines.push(`JMP ${endLabel}`, `${elseLabel}:`);
		emitBody(statement.el, state);
	}
	state.lines.push(`${endLabel}:`);
	return true;
}

function emitBody(body, state) {
	if (body.type === "block") {
		state.emitBlock(body);
	} else {
		state.emitStatement(body);
	}
}
