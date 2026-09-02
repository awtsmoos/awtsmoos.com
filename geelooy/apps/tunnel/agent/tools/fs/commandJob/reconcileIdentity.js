// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const ExitEvidence = require("./reconcileExitEvidence.js");
const Lifecycle = require("./lifecycle.js");
const Identity = require("./processIdentity.js");
const Observe = require("./processObserve.js");
const ProcessGroup = require("./processGroup.js");
const View = require("./reconcileDetachedView.js");

/**
 * @file Arbitrates detached command identity before durable terminal loss is recorded.
 * @description
 * This Tiferes boundary joins exact leader identity with process-family testimony.
 * Awtsmoos.com refuses to brand a naturally finished deed as lost while its honest exit
 * is still crossing the final durable bridge. The Awtsmoos renews process and witness
 * from nothing each instant; bounded evidence gets one last hearing before loss is sealed.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THE NAMED REGRESSION
 * Historical symptom: normal process exit raced durable finalization and became
 * stale_lost_worker. Root cause: verified PID/family death immediately finalized loss.
 * Identity: jobId, exact PID birth identity, process group, durable job metadata.
 * Forbidden simplification: dead process means lost job without bounded exit evidence.
 * Regression: commandReconcileExitEvidence.test.cjs and detachedAndStaleWorkerRecovery.test.cjs.
 */
async function reconcile(config, jobId, meta) {
	const expected = Identity.fromMeta(meta);
	const observed = await Observe.observe(expected.pid);
	const comparison = Identity.compare(expected, observed);
	if (comparison.ok) {
		return View.markDetached(meta, observed);
	}
	if (!expected.processGroupId) {
		return resolveLostIdentity(config, jobId, meta, comparison);
	}
	const group = await ProcessGroup.witness(expected);
	if (group.verified && group.alive) {
		return View.markGroupDetached(meta, comparison, group);
	}
	if (!group.verified) {
		return View.markObservationDeferred(meta, comparison, group);
	}
	return resolveLostIdentity(config, jobId, meta, comparison, group);
}

/**
 * Gives verified process death one bounded chance to reveal live or durable terminal truth.
 * @param {object} config Command runtime configuration.
 * @param {string} jobId Durable command job identity.
 * @param {object} meta Persisted job metadata being reconciled.
 * @param {object} comparison Exact leader identity comparison.
 * @param {object|null} [group=null] Optional verified process-group witness.
 * @returns {Promise<object>} Living, terminal, or stale-lost metadata.
 */
async function resolveLostIdentity(config, jobId, meta, comparison, group = null) {
	if (comparison.state !== "dead") {
		return finalizeLostIdentity(config, jobId, meta, comparison, group);
	}
	const evidence = await ExitEvidence.awaitEvidence(Context, config, jobId);
	if (!evidence) {
		return finalizeLostIdentity(config, jobId, meta, comparison, group);
	}
	if (evidence.kind === "live") {
		return View.mergeLive(meta, evidence.live);
	}
	await Context.refreshCounts(config, jobId, evidence.meta);
	return evidence.meta;
}

/** Finalizes only after exact testimony has ruled out surviving work and delayed exit evidence. */
function finalizeLostIdentity(config, jobId, meta, comparison, group = null) {
	const status = comparison.state === "dead"
		? "stale_lost_worker"
		: "identity_unverified";
	return Lifecycle.finalizeDetached(config, jobId, meta, {
		status,
		staleRecovered: comparison.state === "dead",
		error: comparison.reason || comparison.state,
		processComparison: comparison,
		processGroupWitness: group,
		worker: {
			...(meta.worker || {}),
			detached: true
		}
	});
}

module.exports = {
	finalizeLostIdentity,
	reconcile,
	resolveLostIdentity
};
