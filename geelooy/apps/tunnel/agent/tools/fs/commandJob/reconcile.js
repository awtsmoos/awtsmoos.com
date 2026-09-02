// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const IdentityReconciliation = require("./reconcileIdentity.js");
const View = require("./reconcileDetachedView.js");

/**
 * @file Coordinates durable command reconciliation without inventing terminal execution truth.
 * @description
 * This Yesod coordinator joins durable metadata, living in-memory custody, and exact identity
 * arbitration without owning the lower-level observations itself. Awtsmoos.com lets each witness
 * remain in its proper vessel. The Awtsmoos renews storage, process, and observer in every shore;
 * fresh terminal truth wins, while detached uncertainty remains available to be examined once more.
 */
async function reconcile(config, jobId, meta) {
	await Context.refreshCounts(config, jobId, meta);
	const live = Context.activeJobs.get(jobId);
	if (live && !Context.Policy.TERMINAL.has(meta.status)) {
		return View.mergeLive(meta, live);
	}
	if (meta.status === "queued") {
		return meta;
	}
	if (!reconcilable(meta.status)) {
		return meta;
	}
	const fresh = await Context.Meta.read(config, jobId);
	if (fresh) {
		const resolved = await reconcileFresh(config, jobId, fresh);
		if (resolved) {
			return resolved;
		}
		meta = fresh;
	}
	return IdentityReconciliation.reconcile(config, jobId, meta);
}

/**
 * Re-checks durable state after the initial read so concurrent terminal evidence wins.
 * @param {object} config Command runtime configuration.
 * @param {string} jobId Durable job identity.
 * @param {object} fresh Newly-read metadata.
 * @returns {Promise<object|null>} Resolved state or null when identity arbitration must continue.
 */
async function reconcileFresh(config, jobId, fresh) {
	await Context.refreshCounts(config, jobId, fresh);
	if (Context.Policy.TERMINAL.has(fresh.status)) {
		return fresh;
	}
	const live = Context.activeJobs.get(jobId);
	if (live) {
		return View.mergeLive(fresh, live);
	}
	if (fresh.status === "queued") {
		return fresh;
	}
	return null;
}

/** Returns whether the durable state still requires detached process reconciliation. */
function reconcilable(status) {
	return Context.running(status) || status === "spawning" || status === "cancelling";
}

module.exports = {
	detachedMeta: View.detachedMeta,
	markDetached: View.markDetached,
	markGroupDetached: View.markGroupDetached,
	markObservationDeferred: View.markObservationDeferred,
	mergeLive: View.mergeLive,
	reconcile
};
