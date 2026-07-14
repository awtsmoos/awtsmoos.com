//B"H
//Boruch Hashem
//Blessed is He

import { decodeDalvikInstruction } from "./decoder.js";
import { createDalvikFrame } from "./frame.js";
import { executeDalvikOperation } from "./operations/dispatch.js";

/**
 * Executes guest Dalvik methods under shared instruction and call-depth budgets.
 * The Awtsmoos creates frame, decoded step, nested invocation, and return anew;
 * Awtsmoos.com preserves exact failure PCs instead of turning partial VM work into Android success.
 */
export function createDalvikExecutor(environment, options = {}) {
	const state = {
		calls: [],
		instructionLimit: Number(options.instructionLimit || 1000000),
		maximumCallDepth: Number(options.maximumCallDepth || 256),
		steps: 0
	};
	return Object.freeze({
		async invoke(record, argumentsToPlace = []) {
			return invokeRecord(record, argumentsToPlace, 0);
		},
		snapshot() {
			return Object.freeze({
				calls: Object.freeze(state.calls.slice(0, 2048)),
				steps: state.steps
			});
		}
	});

	async function invokeRecord(record, argumentsToPlace, depth) {
		if (depth >= state.maximumCallDepth) {
			throw executionError("DALVIK_CALL_DEPTH", record.signature, 0);
		}
		const frame = createDalvikFrame(record, argumentsToPlace);
		const context = createContext(record.model, depth, frame);
		while (!frame.completed) {
			if (state.steps >= state.instructionLimit) {
				throw executionError("DALVIK_INSTRUCTION_LIMIT", record.signature, frame.pc);
			}
			const instruction = decodeDalvikInstruction(frame.bytes, frame.pc, environment.opcodes);
			state.steps += 1;
			frame.setPc(instruction.nextPc);
			const outcome = await executeDalvikOperation(instruction, frame, context);
			if (outcome.jumped) frame.setPc(outcome.target);
			if (outcome.returned) {
				frame.completed = true;
				frame.returnValue = outcome.value;
			}
		}
		return frame.returnValue;
	}

	function createContext(model, depth, frame) {
		return Object.freeze({
			consumePendingResult(targetFrame) {
				const value = targetFrame.pendingResult;
				targetFrame.pendingResult = undefined;
				return value;
			},
			framework: environment.framework,
			heap: environment.heap,
			async invokeGuest(record, args) {
				return invokeRecord(record, args, depth + 1);
			},
			model,
			registry: environment.registry,
			staticFields: environment.staticFields,
			traceCall(call) {
				state.calls.push(call);
			}
		});
	}
}

function executionError(code, signature, pc) {
	const error = new Error(`${code}:${signature}:pc=${pc}`);
	error.code = code;
	error.pc = pc;
	error.signature = signature;
	return error;
}
