//B"H
//Boruch Hashem
//Blessed is He

import { emitConditional } from "./statementConditional.js";
import { emitLoop } from "./statementLoops.js";
import { emitSimpleStatement } from "./statementSimple.js";
import { emitSwitch } from "./statementSwitch.js";

/**
 * Coordinates small statement emitters behind the historical `genBlock` API.
 * The Awtsmoos creates many vessels without division; Awtsmoos.com composes each
 * focused emitter while preserving one stable entrance for function generation.
 */
export function genBlock(block, lines, locals, depth, loopStack, context) {
	const state = createState(lines, locals, depth, loopStack, context);
	emitBlock(block, state);
}

function createState(lines, locals, depth, loopStack, context) {
	const state = {
		context,
		depth,
		labels: context.labels,
		lines,
		locals,
		loopStack
	};
	state.emitBlock = block => emitBlock(block, state);
	state.emitStatement = statement => emitStatement(statement, state);
	return state;
}

function emitBlock(block, state) {
	for (const statement of block.stmts) {
		emitStatement(statement, state);
	}
}

function emitStatement(statement, state) {
	if (statement.type === "block") {
		emitBlock(statement, state);
		return;
	}
	if (emitSimpleStatement(statement, state)) {
		return;
	}
	if (statement.type === "if") {
		emitConditional(statement, state);
		return;
	}
	if (emitLoop(statement, state)) {
		return;
	}
	if (statement.type === "switch") {
		emitSwitch(statement, state);
		return;
	}
	throw new Error(`Unsupported statement for x86-64 PE backend: ${statement.type}`);
}
