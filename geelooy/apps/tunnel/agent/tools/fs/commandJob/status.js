// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Locator = require("./jobLocator.js");
const ReceiptLocator = require("./receiptLocator.js");
const Reconcile = require("./reconcile.js");

/**
 * @file Reads command state and renews observable output accounting from durable streams.
 * @description
 * The Awtsmoos reveals whether a command is living, inherited, finished, or gone.
 * Awtsmoos.com also refuses stale cost testimony: a full status view remeasures exactly
 * the stdout and stderr that output paging can serve, without replaying or mutating work.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THE NAMED REGRESSION
 * Terminal status outputBytes must agree with the durable stream bytes even when persisted
 * metadata was finalized before its last output counters. Regression: commandOutputAccounting.test.cjs.
 */
async function commandStatus(config = {}, payload = {}) {
	const jobId = Context.Policy.cleanId(payload.jobId || payload.id || "");
	if (!jobId) return missing(payload, "missing_jobId");
	const located = await Locator.locate(config, jobId);
	if (located.ok) return fullStatus(payload, jobId, await reconcileLocated(located, jobId));
	if (located.error !== "job_not_found_or_expired") {
		return missing(payload, located.error, jobId, located);
	}
	const receipt = await ReceiptLocator.locate(config, jobId);
	if (receipt.ok) return receiptStatus(payload, jobId, receipt);
	if (receipt.error !== "receipt_not_found") {
		return missing(payload, receipt.error, jobId, receipt);
	}
	return missing(payload, located.error, jobId, located);
}

/** Reconciles exact process ownership, then derives output counters from the located root. */
async function reconcileLocated(located, jobId) {
	const meta = await Reconcile.reconcile(located.config, jobId, located.meta);
	await Context.refreshCounts(located.config, jobId, meta);
	return { ...located, meta };
}

function fullStatus(payload, jobId, located) {
	return {
		...Context.Responses.status(jobId, located.meta, payload),
		resolvedStateRoot: located.stateRoot,
		crossRootResolved: located.current !== true,
		receiptOnly: false,
		fullOutputAvailable: true
	};
}

function receiptStatus(payload, jobId, located) {
	const response = Context.Responses.status(jobId, located.receipt.meta, payload);
	return {
		...response,
		receiptOnly: true,
		incidentReceipt: true,
		fullOutputAvailable: false,
		resolvedStateRoot: located.stateRoot,
		crossRootResolved: located.current !== true,
		receiptCreatedAt: located.receipt.createdAt
	};
}

function missing(payload, error, jobId, located = {}) {
	return Context.named(payload, "commandStatus", {
		ok: false,
		error,
		jobId,
		matches: located.matches,
		searchedRoots: located.searchedRoots
	});
}

module.exports = { commandStatus, reconcileLocated };
