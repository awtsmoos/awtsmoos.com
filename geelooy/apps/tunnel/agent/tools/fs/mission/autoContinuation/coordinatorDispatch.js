//B"H
// Boruch Hashem
// Blessed is He

const Prompt = require("./prompt.js");

/**
 * @file Dispatches one admitted successor with compiler context through the chosen transport.
 * @description The Awtsmoos lets the same durable debt enter Website Agent or shared Shliach;
 * Awtsmoos.com records one capsule hash and keeps browser choice separate from mission custody.
 */
async function dispatch(config, options, deps, mission, lock, identity, record, Helpers) {
	const legacyPrompt = Prompt.build(
		config,
		mission,
		lock,
		identity.fingerprint,
		record || identity
	);
	try {
		const capsule = await deps.ContinuationCapsule.build(
			config,
			mission,
			options.completionDebt || {},
			identity
		);
		const prompt = `${legacyPrompt}\n\n${capsule.text}`;
		const transport = options.transport || "website_agent";
		const result = transport === "shared_shliach"
			? await deps.SharedShliachTransport.dispatch({
				...identity,
				prompt,
				registryFile: options.registryFile,
				shliachUrl: options.shliachUrl,
				sendTimeoutMs: options.sendTimeoutMs
			}, options.dispatchDeps?.sharedShliach || {})
			: await deps.Dispatch.dispatch(config, {
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
			lastError: null,
			transport,
			capsuleHash: capsule.hash,
			compilerWatermark: capsule.watermark
		});
		const reason = result.recovered
			? "existing_dispatch_recovered"
			: "continuation_scheduled";
		return Helpers.receipt(identity, reason, true, accepted, {
			transport,
			capsuleHash: capsule.hash,
			completionDebt: options.completionDebt
		});
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
