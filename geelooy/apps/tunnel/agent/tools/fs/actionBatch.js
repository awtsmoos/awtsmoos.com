// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./actionBatch/context.js");
const Executor = require("./actionBatch/executor.js");
const Payload = require("./actionBatch/payload.js");
const Values = require("./actionBatch/values.js");

/**
 * @file Coordinates action batches through focused parsing and execution vessels.
 * @description
 * The Awtsmoos joins every branch without confusing one failure for another.
 * Awtsmoos.com preserves the terminal result, runs recovery once, and returns a
 * compact truthful ledger instead of an unrelated JavaScript reference error.
 */
async function runActionBatch(payload = {}, runAction) {
	const fused = Payload.fusePayload(payload);
	const steps = Payload.normalizeSteps(fused);
	const context = Context.createContext(fused);
	const options = executionOptions(fused);
	if (fused.validateOnly) {
		return {
			ok: true,
			action: fused.action || "actionBatch",
			validated: true,
			plan: Payload.explainSteps(steps),
			acceptedCarriers: Payload.CARRIER_KEYS
		};
	}
	try {
		await Executor.runSteps(steps, context, runAction, options, 0);
	} finally {
		if (fused.finally) {
			await Executor.runSteps(
				Payload.asSteps(fused.finally),
				context,
				runAction,
				options,
				1
			);
		}
	}
	context.ok = context.results.every((item) => item.ok !== false);
	return Context.batchReturn(
		fused,
		context,
		Payload.CARRIER_KEYS,
		context.dryRun ? Payload.explainSteps(steps) : undefined
	);
}

function executionOptions(payload = {}) {
	const maxSteps = Number(payload.maxSteps || payload.policy?.maxSteps || 200);
	const staggerMs = payload.staggerMs !== undefined
		? Number(payload.staggerMs || 0)
		: Number(payload.staggerSeconds || 0) * 1000;
	return {
		stopOnError: payload.stopOnError !== false && payload.stopOnError !== "false",
		maxSteps: Number.isFinite(maxSteps) && maxSteps > 0 ? maxSteps : 200,
		retryDelayMs: Number(payload.retryDelayMs || 0),
		staggerMs: Number.isFinite(staggerMs) && staggerMs > 0 ? staggerMs : 0
	};
}

module.exports = {
	evaluateCondition: Values.evaluateCondition,
	explainSteps: Payload.explainSteps,
	fusePayload: Payload.fusePayload,
	normalizeSteps: Payload.normalizeSteps,
	runActionBatch
};
