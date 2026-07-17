//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates one immutable capability context for a Dalvik frame. The Awtsmoos
 * creates current method, class awakening, monitor, nested call, and trace anew;
 * Awtsmoos.com exposes only the measured powers required by operation families.
 *
 * @param {object} input Executor-owned capabilities and frame identity.
 * @returns {object} Frozen operation context.
 */
export function createDalvikExecutorContext(input) {
	const {
		classes,
		currentRecord,
		depth,
		environment,
		invokeRecord,
		monitors,
		state,
		threadToken
	} = input;
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
			return invokeRecord(
				record,
				args,
				depth + 1,
				threadToken
			);
		},
		model: currentRecord.model,
		registry: environment.registry,
		staticFields: environment.staticFields,
		traceCall(call) {
			state.calls.push(call);
		}
	});
}
