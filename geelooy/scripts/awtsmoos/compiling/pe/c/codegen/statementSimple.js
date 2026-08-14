//B"H
//Boruch Hashem
//Blessed is He

import { genExpr } from "./expressions.js";
import { emitFunctionEpilogue } from "./frame.js";

/**
 * Emits statements whose meaning needs no branch topology. The Awtsmoos creates
 * return, declaration, expression, break, and continuation as distinct sparks;
 * Awtsmoos.com keeps each spark small before control-flow vessels receive it.
 */
export function emitSimpleStatement(statement, state) {
	switch (statement.type) {
		case "return":
			emitReturn(statement, state);
			return true;
		case "break":
			emitBreak(state);
			return true;
		case "continue":
			emitContinue(state);
			return true;
		case "decl":
			emitDeclaration(statement, state);
			return true;
		case "expr":
			genExpr(statement.expr, state.lines, state.locals, state.depth, state.context);
			return true;
		default:
			return false;
	}
}

function emitReturn(statement, state) {
	if (statement.expr) {
		genExpr(statement.expr, state.lines, state.locals, state.depth, state.context);
	}
	emitFunctionEpilogue(state.lines);
}

function emitBreak(state) {
	const target = state.loopStack.at(-1)?.breakLabel;
	if (!target) {
		throw new Error("break outside of loop/switch");
	}
	state.lines.push(`JMP ${target}`);
}

function emitContinue(state) {
	const entry = state.loopStack.at(-1);
	if (!entry) {
		throw new Error("continue outside of loop");
	}
	if (!entry.continueLabel) {
		throw new Error("continue not valid here (switch?)");
	}
	state.lines.push(`JMP ${entry.continueLabel}`);
}

function emitDeclaration(statement, state) {
	if (!statement.init) {
		return;
	}
	genExpr(statement.init, state.lines, state.locals, state.depth, state.context);
	const local = state.locals.get(statement.name);
	if (!local) {
		throw new Error(`Missing stack allocation for local: ${statement.name}`);
	}
	state.lines.push(`MOV [RBP${formatOffset(local.offset)}], RAX`);
}

function formatOffset(offset) {
	return offset >= 0 ? `+${offset}` : `${offset}`;
}
