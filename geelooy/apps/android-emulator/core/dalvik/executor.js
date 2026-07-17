//B"H
//Boruch Hashem
//Blessed is He

import { createDalvikClassInitializer } from "./classInitializer.js";
import { decodeDalvikInstruction } from "./decoder.js";
import { createDalvikFrame } from "./frame.js";
import { createDalvikMonitorRegistry } from "./monitorRegistry.js";
import { executeDalvikOperation } from "./operations/dispatch.js";

/**
 * Executes guest methods under shared budgets, class initialization, dynamic
 * dispatch, and reentrant monitors. The Awtsmoos creates frame, initialized class,
 * logical thread, nested call, and return anew; Awtsmoos.com preserves exact
 * failure PCs instead of calling this measured browser vessel Complete ART.
 */
export function createDalvikExecutor(environment, options = {}) {
	const monitors = environment.monitors || createDalvikMonitorRegistry();
	const state = {
		calls: [],
		instructionLimit: Number(options.instructionLimit || 1000000),
		maximumCallDepth: Number(options.maximumCallDepth || 256),
		steps: 0
	};
	const classes = environment.classInitializer
		|| createDalvikClassInitializer({
			invoke(record, args, depth, owner) {
				return invokeRecord(record, args, depth, owner);
			},
			registry: environment.registry
		});
	return Object.freeze({
		async invoke(record, argumentsToPlace = []) {
			return invokeRecord(
				record,
				argumentsToPlace,
				0,
				Symbol(record.signature || "dalvik-thread")
			);
		},
		snapshot() {
			return Object.freeze({
				calls: Object.freeze(state.calls.slice(0, 2048)),
				classInitializations: classes.snapshot(),
				monitors: monitors.snapshot(),
				steps: state.steps
			});
		}
	});

	async function invokeRecord(record, argumentsToPlace, depth, threadToken) {
		if (depth >= state.maximumCallDepth) {
			throw executionError("DALVIK_CALL_DEPTH", record.signature, 0);
		}
		const frame = createDalvikFrame(record, argumentsToPlace);
		const context = createContext(record, depth, threadToken);
		while (!frame.completed) {
			if (state.steps >= state.instructionLimit) {
				throw executionError(
					"DALVIK_INSTRUCTION_LIMIT",
					record.signature,
					frame.pc
				);
			}
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

	function createContext(currentRecord, depth, threadToken) {
		return Object.freeze({
			consumePendingResult(targetFrame) {
				const value = targetFrame.pendingResult;
				targetFrame.pendingResult = undefined;
				return value;
			},
			currentRecord,
			ensureClassInitialized(classType) {
				return classes.ensure(classType, threadToken, depth);
			},
			enterMonitor(reference) {
				return monitors.enter(reference, threadToken);
			},
			exitMonitor(reference) {
				return monitors.exit(reference, threadToken);
			},
			framework: environment.framework,
			heap: environment.heap,
			invokeGuest(record, args) {
				return invokeRecord(record, args, depth + 1, threadToken);
			},
			model: currentRecord.model,
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
