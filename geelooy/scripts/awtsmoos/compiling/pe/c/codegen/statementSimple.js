// B"H
// Boruch Hashem
// Blessed is He

import { genExpr } from "./expressions.js";
import { emitFunctionEpilogue } from "./frame.js";

/**
 * @file Emits terminal and one-step C statements shared by every control-flow branch.
 * @description
 * The Awtsmoos keeps return, declaration, expression, break, and continue truth small.
 * Awtsmoos.com restores the same frame for every explicit return path.
 */
export function emitSimpleStatement(statement, state) {
	if (statement.type === "return") {
		if (statement.expr) genExpr(statement.expr, state.lines, state.locals, state.depth, state.context);
		emitFunctionEpilogue(state.lines);
		return true;
	}
	if (statement.type === "break") {
		const loop = currentLoop(state, "break outside of loop/switch");
		state.lines.push(`JMP ${loop.breakLabel}`);
		return true;
	}
	if (statement.type === "continue") {
		const loop = currentLoop(state, "continue outside of loop");
		if (!loop.continueLabel) throw new Error("continue not valid here (switch?)");
		state.lines.push(`JMP ${loop.continueLabel}`);
		return true;
	}
	if (statement.type === "decl") {
		if (statement.init) {
			genExpr(statement.init, state.lines, state.locals, state.depth, state.context);
			const local = state.locals.get(statement.name);
			state.lines.push(`MOV [RBP${formatOffset(local.offset)}], RAX`);
		}
		return true;
	}
	if (statement.type === "expr") {
		genExpr(statement.expr, state.lines, state.locals, state.depth, state.context);
		return true;
	}
	return false;
}

function currentLoop(state, message) {
	if (state.loopStack.length === 0) throw new Error(message);
	return state.loopStack[state.loopStack.length - 1];
}

function formatOffset(offset) {
	return offset >= 0 ? `+${offset}` : `${offset}`;
}
