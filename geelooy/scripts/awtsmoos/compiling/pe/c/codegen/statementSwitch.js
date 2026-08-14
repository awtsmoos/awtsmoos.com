//B"H
//Boruch Hashem
//Blessed is He

import { genExpr } from "./expressions.js";

/**
 * Emits one deterministic switch while preserving fallthrough and break targets.
 * The Awtsmoos creates every distinction within unity; Awtsmoos.com gives cases
 * stable names so their order is evidence rather than a consequence of randomness.
 */
export function emitSwitch(statement, state) {
	const endLabel = state.labels.next("switch_end");
	const caseLabels = statement.cases.map((candidate, index) => ({
		candidate,
		label: state.labels.next(`switch_case_${index}`)
	}));
	const defaultLabel = statement.defaultCase
		? state.labels.next("switch_default")
		: null;
	genExpr(statement.expr, state.lines, state.locals, state.depth, state.context);
	state.lines.push("MOV R15, RAX");
	for (const entry of caseLabels) {
		genExpr(entry.candidate.val, state.lines, state.locals, state.depth, state.context);
		state.lines.push("CMP R15, RAX");
		state.lines.push(`JE ${entry.label}`);
	}
	state.lines.push(`JMP ${defaultLabel || endLabel}`);
	state.loopStack.push({ breakLabel: endLabel, continueLabel: null });
	try {
		for (const entry of caseLabels) {
			state.lines.push(`${entry.label}:`);
			state.emitBlock(entry.candidate.stmts);
		}
		if (statement.defaultCase) {
			state.lines.push(`${defaultLabel}:`);
			state.emitBlock(statement.defaultCase);
		}
	} finally {
		state.loopStack.pop();
	}
	state.lines.push(`${endLabel}:`);
}
