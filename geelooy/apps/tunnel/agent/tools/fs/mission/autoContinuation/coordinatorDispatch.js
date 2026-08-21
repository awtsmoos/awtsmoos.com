// B"H
// Boruch Hashem
// Blessed is He

const Prompt = require("./prompt.js");

/**
 * @file Dispatches one already-admitted successor without descendant count ceilings.
 * @description
 * The Awtsmoos lets declared unfinished work continue through as many generations as
 * needed. Awtsmoos.com reaches the browser only after spawn-group custody is held,
 * while physical spacing—not an arbitrary descendant count—governs launch pressure.
 */
async function dispatch(config, options, deps, mission, lock, identity, record, Helpers) {
	const prompt = Prompt.build(
		config,
		mission,
		lock,
		identity.fingerprint,
		record || identity
	);
	try {
		const result = await deps.Dispatch.dispatch(config, {
			...identity,
			prompt,
			maxContinuationTurns: options.maxContinuationTurns
		}, options.dispatchDeps || {});
		if (!result.ok) {
			return failed(config, deps, identity, record, result.error, result.error, Helpers);
		}
		const state = result.recovered ? "recovered" : "accepted";
		const accepted = deps.State.mark(config, record, state, {
			acceptedAt: new Date(Number(options.now || Date.now())).toISOString(),
			lastError: null
		});
		const reason = result.recovered
			? "existing_dispatch_recovered"
			: "continuation_scheduled";
		return Helpers.receipt(identity, reason, true, accepted);
	} catch (error) {
		return failed(
			config,
			deps,
			identity,
			record,
			error?.message || String(error),
			"continuation_dispatch_exception",
			Helpers
		);
	}
}

function failed(config, deps, identity, record, error, reason, Helpers) {
	const failedRecord = deps.State.mark(config, record, "failed", {
		lastError: error
	});
	return Helpers.receipt(identity, reason, false, failedRecord);
}

module.exports = { dispatch, failed };
