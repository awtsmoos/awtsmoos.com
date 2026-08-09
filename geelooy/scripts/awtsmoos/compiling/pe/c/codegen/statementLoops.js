// B"H
// Boruch Hashem
// Blessed is He

import { genExpr } from "./expressions.js";

/**
 * @file Emits deterministic while, do/while, and for control flow.
 * @description
 * The Awtsmoos gives each loop one ordered beginning, continuation, and end.
 * Awtsmoos.com keeps break/continue targets explicit on the shared loop stack.
 */
export function emitLoop(statement, state) {
	if (statement.type === "while") return emitWhile(statement, state);
	if (statement.type === "do_while") return emitDoWhile(statement, state);
	if (statement.type === "for") return emitFor(statement, state);
	return false;
}

function emitWhile(statement, state) {
	const loop = state.labels.next("while");
	const end = state.labels.next("while_end");
	state.lines.push(`${loop}:`);
	emitCondition(statement.cond, end, state);
	withLoop({ breakLabel: end, continueLabel: loop }, state, () => emitBody(statement.body, state));
	state.lines.push(`JMP ${loop}`, `${end}:`);
	return true;
}

function emitDoWhile(statement, state) {
	const start = state.labels.next("do");
	const condition = state.labels.next("do_cond");
	const end = state.labels.next("do_end");
	state.lines.push(`${start}:`);
	withLoop({ breakLabel: end, continueLabel: condition }, state, () => emitBody(statement.body, state));
	state.lines.push(`${condition}:`);
	genExpr(statement.cond, state.lines, state.locals, state.depth, state.context);
	state.lines.push("CMP RAX, 0", `JNE ${start}`, `${end}:`);
	return true;
}

function emitFor(statement, state) {
	const loop = state.labels.next("for");
	const step = state.labels.next("for_step");
	const end = state.labels.next("for_end");
	if (statement.init) state.emitStatement(statement.init);
	state.lines.push(`${loop}:`);
	if (statement.cond) emitCondition(statement.cond, end, state);
	withLoop({ breakLabel: end, continueLabel: step }, state, () => emitBody(statement.body, state));
	state.lines.push(`${step}:`);
	if (statement.step) genExpr(statement.step, state.lines, state.locals, state.depth, state.context);
	state.lines.push(`JMP ${loop}`, `${end}:`);
	return true;
}

function emitCondition(expression, falseLabel, state) {
	genExpr(expression, state.lines, state.locals, state.depth, state.context);
	state.lines.push("CMP RAX, 0", `JE ${falseLabel}`);
}

function emitBody(body, state) {
	body.type === "block" ? state.emitBlock(body) : state.emitStatement(body);
}

function withLoop(loop, state, callback) {
	state.loopStack.push(loop);
	try {
		callback();
	} finally {
		state.loopStack.pop();
	}
}
