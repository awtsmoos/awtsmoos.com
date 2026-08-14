//B"H
//Boruch Hashem
//Blessed is He

import { genExpr } from "./expressions.js";

/**
 * Emits deterministic while, do-while, and for loops. The Awtsmoos creates every
 * cycle without repetition of essence; Awtsmoos.com gives each machine cycle a
 * stable entrance, continuation, and exit so identical source yields equal bytes.
 */
export function emitLoop(statement, state) {
	switch (statement.type) {
		case "while":
			emitWhile(statement, state);
			return true;
		case "do_while":
			emitDoWhile(statement, state);
			return true;
		case "for":
			emitFor(statement, state);
			return true;
		default:
			return false;
	}
}

function emitWhile(statement, state) {
	const loopLabel = state.labels.next("while_loop");
	const endLabel = state.labels.next("while_end");
	state.lines.push(`${loopLabel}:`);
	emitCondition(statement.cond, endLabel, state);
	withLoop({ breakLabel: endLabel, continueLabel: loopLabel }, state, () => {
		state.emitBlock(statement.body);
	});
	state.lines.push(`JMP ${loopLabel}`);
	state.lines.push(`${endLabel}:`);
}

function emitDoWhile(statement, state) {
	const startLabel = state.labels.next("do_start");
	const conditionLabel = state.labels.next("do_condition");
	const endLabel = state.labels.next("do_end");
	state.lines.push(`${startLabel}:`);
	withLoop({ breakLabel: endLabel, continueLabel: conditionLabel }, state, () => {
		state.emitBlock(statement.body);
	});
	state.lines.push(`${conditionLabel}:`);
	genExpr(statement.cond, state.lines, state.locals, state.depth, state.context);
	state.lines.push("CMP RAX, 0");
	state.lines.push(`JNE ${startLabel}`);
	state.lines.push(`${endLabel}:`);
}

function emitFor(statement, state) {
	const loopLabel = state.labels.next("for_loop");
	const stepLabel = state.labels.next("for_step");
	const endLabel = state.labels.next("for_end");
	if (statement.init) {
		state.emitStatement(statement.init);
	}
	state.lines.push(`${loopLabel}:`);
	if (statement.cond) {
		emitCondition(statement.cond, endLabel, state);
	}
	withLoop({ breakLabel: endLabel, continueLabel: stepLabel }, state, () => {
		state.emitBlock(statement.body);
	});
	state.lines.push(`${stepLabel}:`);
	if (statement.step) {
		genExpr(statement.step, state.lines, state.locals, state.depth, state.context);
	}
	state.lines.push(`JMP ${loopLabel}`);
	state.lines.push(`${endLabel}:`);
}

function emitCondition(expression, falseLabel, state) {
	genExpr(expression, state.lines, state.locals, state.depth, state.context);
	state.lines.push("CMP RAX, 0");
	state.lines.push(`JE ${falseLabel}`);
}

function withLoop(entry, state, emitBody) {
	state.loopStack.push(entry);
	try {
		emitBody();
	} finally {
		state.loopStack.pop();
	}
}
