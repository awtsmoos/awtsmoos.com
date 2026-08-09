// B"H
// Boruch Hashem
// Blessed is He

import { genExpr } from "./expressions.js";

/**
 * @file Emits deterministic C switch/case fallthrough and break control flow.
 * @description
 * The Awtsmoos preserves the switch value in saved R15 while each case reveals its
 * own ordered label. Awtsmoos.com keeps natural C fallthrough until an explicit break.
 */
export function emitSwitch(statement, state) {
	if (statement.type !== "switch") return false;
	const end = state.labels.next("switch_end");
	const caseLabels = (statement.cases || []).map(() => state.labels.next("case"));
	const defaultLabel = statement.defaultCase ? state.labels.next("default") : null;
	genExpr(statement.expr, state.lines, state.locals, state.depth, state.context);
	state.lines.push("MOV R15, RAX");
	for (let index = 0; index < statement.cases.length; index++) {
		genExpr(statement.cases[index].val, state.lines, state.locals, state.depth, state.context);
		state.lines.push("CMP R15, RAX", `JE ${caseLabels[index]}`);
	}
	state.lines.push(`JMP ${defaultLabel || end}`);
	state.loopStack.push({ breakLabel: end, continueLabel: null });
	try {
		for (let index = 0; index < statement.cases.length; index++) {
			state.lines.push(`${caseLabels[index]}:`);
			emitBody(statement.cases[index].stmts, state);
		}
		if (statement.defaultCase) {
			state.lines.push(`${defaultLabel}:`);
			emitBody(statement.defaultCase, state);
		}
	} finally {
		state.loopStack.pop();
	}
	state.lines.push(`${end}:`);
	return true;
}

function emitBody(body, state) {
	body.type === "block" ? state.emitBlock(body) : state.emitStatement(body);
}
