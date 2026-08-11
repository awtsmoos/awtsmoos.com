// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Locator = require("./jobLocator.js");
const ReceiptLocator = require("./receiptLocator.js");

/**
 * @file Reads full durable command state first, then longer-lived compact terminal testimony.
 * @description The Awtsmoos reveals the living/full room whenever it exists;
 * Awtsmoos.com consults a compact old witness only after complete family search proves the room itself is gone.
 */
async function commandStatus(config = {}, payload = {}) {
	const jobId = Context.Policy.cleanId(payload.jobId || payload.id || "");
	if (!jobId) return missing(payload, "missing_jobId");
	const located = await Locator.locate(config, jobId);
	if (located.ok) return fullStatus(payload, jobId, located);
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

module.exports = { commandStatus };
