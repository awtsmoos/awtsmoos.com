// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Locator = require("./jobLocator.js");
const Reconciliation = require("./reconcile.js");

/**
 * @file Resolves durable status across project-root-derived state vessels.
 * @description
 * The Awtsmoos tries today's command room first, then reveals the exact sibling room
 * only when needed. Awtsmoos.com reconciles process/output testimony against the same
 * located config instead of declaring durable work missing after a root crossing.
 */
async function commandStatus(config = {}, payload = {}) {
	const jobId = Context.Policy.cleanId(payload.jobId || payload.id || "");
	if (!jobId) {
		return Context.named(payload, "commandStatus", {
			ok: false,
			error: "missing_jobId",
			status: "missing_jobId"
		});
	}
	const located = await Locator.locate(config, jobId);
	if (!located.ok) return missing(payload, jobId, located);
	const meta = await Reconciliation.reconcile(
		located.config,
		jobId,
		located.meta
	);
	return {
		...Context.Responses.status(jobId, meta, payload),
		resolvedStateRoot: located.stateRoot,
		crossRootResolved: located.current !== true
	};
}

function missing(payload, jobId, located) {
	return Context.named(payload, "commandStatus", {
		ok: false,
		error: located.error || "job_not_found_or_expired",
		status: located.error === "job_state_ambiguous" ? "ambiguous" : "missing",
		jobId,
		matches: located.matches,
		searchedRoots: located.searchedRoots
	});
}

module.exports = { commandStatus };
