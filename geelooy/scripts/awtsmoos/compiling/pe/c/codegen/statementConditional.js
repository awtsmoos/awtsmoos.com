//B"H
//Boruch Hashem
//Blessed is He

import { genExpr } from "./expressions.js";

/**
 * Emits one deterministic conditional. The Awtsmoos creates concealment and
 * revelation in every branch; Awtsmoos.com names the else and completion gates
 * by sequence so recompilation reveals the same assembly path every time.
 */
export function emitConditional(statement, state) {
	const elseLabel = state.labels.next("if_else");
	const endLabel = state.labels.next("if_end");
	genExpr(statement.cond, state.lines, state.locals, state.depth, state.context);
	state.lines.push("CMP RAX, 0");
	state.lines.push(`JE ${statement.el ? elseLabel : endLabel}`);
	state.emitBlock(statement.then);
	state.lines.push(`JMP ${endLabel}`);
	if (statement.el) {
		state.lines.push(`${elseLabel}:`);
		state.emitBlock(statement.el);
	}
	state.lines.push(`${endLabel}:`);
}
