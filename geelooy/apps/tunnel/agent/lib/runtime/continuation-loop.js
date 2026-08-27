// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./continuation-identity.js");
const Policy = require("./continuation-policy.js");
const Results = require("./continuation-result.js");

/**
 * @file Runs bounded mission continuation while preserving one execution witness.
 * @description
 * The Awtsmoos may reveal several inner mission steps within one outer request.
 * Awtsmoos.com carries the same execution observer through every internal dispatch,
 * so hidden continuation work cannot escape worker-admission health testimony.
 */
async function run(context = {}) {
	const first = context.result;
	const sacred = Identity.identity(context.payload, context.data, first);
	const trace = [];
	const seen = new Map();
	let result = first;
	let final = null;
	const maximum = Policy.budget(context.payload, context.maxSteps);

	for (let step = 0; step < maximum && Policy.needs(result); step += 1) {
		const next = result.nextRequiredToolCall;
		if (!Policy.allowed(next)) {
			return Results.preserve(
				first,
				result,
				trace,
				"next_action_not_allowed_for_internal_loop",
				sacred
			);
		}
		const repetitionKey = `${next.action}:${next.missionId || ""}`;
		seen.set(repetitionKey, Number(seen.get(repetitionKey) || 0) + 1);
		if (seen.get(repetitionKey) > 2) {
			return Results.preserve(
				first,
				result,
				trace,
				"repeated_next_action_loop_guard",
				sacred
			);
		}
		trace.push(traceEntry(step + 1, next));
		const payload = continuationPayload(next, result, sacred);
		const data = continuationData(context.data, sacred, step + 1);
		final = await context.dispatch(
			context.normalize(payload),
			payload,
			context.ws,
			data,
			context.executionObserver
		);
		result = final;
	}

	return trace.length
		? Results.preserve(first, final || result, trace, "", sacred)
		: first;
}

function continuationPayload(next, result, sacred) {
	return {
		...next,
		kind: "fs",
		autoContinuation: true,
		continuationToken: result.continuationToken,
		originalAction: sacred.requestAction
	};
}

function continuationData(data = {}, sacred = {}, step = 1) {
	return {
		...data,
		id: `${data?.id || sacred.id || "auto"}:continue:${step}`
	};
}

function traceEntry(step, next = {}) {
	return {
		step,
		action: next.action,
		missionId: next.missionId || "",
		reason: next.reason || ""
	};
}

module.exports = {
	allowed: Policy.allowed,
	budget: Policy.budget,
	continuationData,
	continuationPayload,
	identity: Identity.identity,
	mark: Results.mark,
	needs: Policy.needs,
	preserve: Results.preserve,
	restoreIdentity: Identity.restoreIdentity,
	run,
	traceEntry
};
