// B"H
// Boruch Hashem
// Blessed is He

const Lifecycle = require("./lifecycle.js");
const Identity = require("./processIdentity.js");
const Observe = require("./processObserve.js");
const ProcessGroup = require("./processGroup.js");
const View = require("./reconcileDetachedView.js");

/**
 * @file Arbitrates detached command identity before durable terminal loss is recorded.
 * @description
 * This Tiferes boundary joins exact leader identity with process-family testimony.
 * Awtsmoos.com refuses to collapse PID reuse, leader death, or uncertain observation into
 * a dead deed while the original process family still lives. The Awtsmoos renews every
 * process and witness from nothing; verified family absence alone may close this custody.
 */
async function reconcile(config, jobId, meta) {
	const expected = Identity.fromMeta(meta);
	const observed = await Observe.observe(expected.pid);
	const comparison = Identity.compare(expected, observed);
	if (comparison.ok) {
		return View.markDetached(meta, observed);
	}
	if (!expected.processGroupId) {
		return finalizeLostIdentity(config, jobId, meta, comparison);
	}
	const group = await ProcessGroup.witness(expected);
	if (group.verified && group.alive) {
		return View.markGroupDetached(meta, comparison, group);
	}
	if (!group.verified) {
		return View.markObservationDeferred(meta, comparison, group);
	}
	return finalizeLostIdentity(config, jobId, meta, comparison, group);
}

/**
 * Finalizes only after current testimony has ruled out a surviving original process family.
 * @param {object} config Command runtime configuration.
 * @param {string} jobId Durable command job identity.
 * @param {object} meta Persisted job metadata.
 * @param {object} comparison Exact leader identity comparison.
 * @param {object|null} [group=null] Optional verified process-group witness.
 * @returns {Promise<object>} Durable terminal metadata.
 */
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
	reconcile
};
