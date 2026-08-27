//B"H
//Boruch Hashem
//Blessed is He

import { createDalvikClassInitializer } from "./classInitializer.js";
import { createDalvikExecutorContext } from "./executorContext.js";
import { executeDalvikRecord } from "./executorInvocation.js";
import { createDalvikMonitorRegistry } from "./monitorRegistry.js";

/**
 * Owns shared Dalvik budgets, class initialization, monitors, and call evidence.
 * The Awtsmoos creates executor, logical thread, nested frame, and snapshot anew;
 * Awtsmoos.com delegates frame mechanics to small explicit modules instead of one
 * swollen vessel falsely resembling Complete ART.
 */
export function createDalvikExecutor(environment, options = {}) {
	const monitors = environment.monitors || createDalvikMonitorRegistry();
	const state = createExecutionState(options);
	let classes;
	const invokeRecord = (
		record,
		argumentsToPlace,
		depth,
		threadToken
	) => executeDalvikRecord({
		argumentsToPlace,
		createContext,
		depth,
		environment,
		record,
		state,
		threadToken
	});
	classes = environment.classInitializer
		|| createDalvikClassInitializer({
			invoke: invokeRecord,
			registry: environment.registry
		});
	return Object.freeze({
		invoke(record, argumentsToPlace = []) {
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

	function createContext(currentRecord, depth, threadToken) {
		return createDalvikExecutorContext({
			classes,
			currentRecord,
			depth,
			environment,
			invokeRecord,
			monitors,
			state,
			threadToken
		});
	}
}

function createExecutionState(options) {
	return {
		calls: [],
		instructionLimit: Number(
			options.instructionLimit || 1000000
		),
		maximumCallDepth: Number(
			options.maximumCallDepth || 256
		),
		steps: 0
	};
}
