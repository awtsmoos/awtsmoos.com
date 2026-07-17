//B"H
//Boruch Hashem
//Blessed is He

import { decodeDalvikInstruction } from "./decoder.js";
import { createDalvikFrame } from "./frame.js";
import { executeDalvikOperation } from "./operations/dispatch.js";

/**
 * Executes one guest method frame under shared instruction and depth budgets. The
 * Awtsmoos creates bytecode step, program counter, branch, and return anew;
 * Awtsmoos.com keeps loop mechanics separate from executor-owned global state.
 *
 * @param {object} input Invocation dependencies and measured guest arguments.
 * @returns {Promise<unknown>} Guest method return value.
 */
export async function executeDalvikRecord(input) {
	const {
		argumentsToPlace,
		createContext,
		depth,
		environment,
		record,
		state,
		threadToken
	} = input;
	assertCallDepth(state, record, depth);
	const frame = createDalvikFrame(record, argumentsToPlace);
	const context = createContext(record, depth, threadToken);
	while (!frame.completed) {
		assertInstructionBudget(state, record, frame.pc);
		const instruction = decodeDalvikInstruction(
			frame.bytes,
			frame.pc,
			environment.opcodes
		);
		state.steps += 1;
		frame.setPc(instruction.nextPc);
		const outcome = await executeDalvikOperation(
			instruction,
			frame,
			context
		);
		if (outcome.jumped) frame.setPc(outcome.target);
		if (outcome.returned) {
			frame.completed = true;
			frame.returnValue = outcome.value;
		}
	}
	return frame.returnValue;
}

function assertCallDepth(state, record, depth) {
	if (depth < state.maximumCallDepth) return;
	throw executionError("DALVIK_CALL_DEPTH", record.signature, 0);
}

function assertInstructionBudget(state, record, pc) {
	if (state.steps < state.instructionLimit) return;
	throw executionError(
		"DALVIK_INSTRUCTION_LIMIT",
		record.signature,
		pc
	);
}

function executionError(code, signature, pc) {
	const error = new Error(`${code}:${signature}:pc=${pc}`);
	error.code = code;
	error.pc = pc;
	error.signature = signature;
	return error;
}
