// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Locator = require("./jobLocator.js");
const PollingGuidance = require("./pollingGuidance.js");
const Receipt = require("./terminalReceipt.js");
const ReceiptLocator = require("./receiptLocator.js");
const WriteSnapshot = require("./writeSnapshot.js");

/**
 * @file Reads full command output first, then one explicitly partial compact terminal tail.
 * @description The Awtsmoos reveals the exact durable room while it exists;
 * Awtsmoos.com names old receipt bytes honestly after the heavy room has been reclaimed.
 */
async function commandJobOutputPage(config = {}, payload = {}) {
	const jobId = Context.Policy.cleanId(payload.jobId || payload.id || "");
	if (!jobId) return missing(payload, "missing_jobId");
	const stream = selectedStream(payload.stream);
	const located = await Locator.locate(config, jobId);
	if (located.ok) return fullPage(payload, jobId, stream, located);
	if (located.error !== "job_not_found_or_expired") {
		return missing(payload, located.error, jobId, located);
	}
	const receipt = await ReceiptLocator.locate(config, jobId);
	if (receipt.ok) return receiptPage(payload, jobId, stream, receipt);
	if (receipt.error !== "receipt_not_found") {
		return missing(payload, receipt.error, jobId, receipt);
	}
	return missing(payload, located.error, jobId, located);
}

async function fullPage(payload, jobId, stream, located) {
	const snapshot = await WriteSnapshot.observe(jobId, Context.activeJobs, payload);
	const meta = await Context.Meta.read(located.config, jobId) || located.meta;
	const guidance = PollingGuidance.forJob(meta, snapshot);
	const response = await Context.Responses.page(
		located.config,
		jobId,
		stream,
		payload,
		{ ...snapshot, ...guidance, meta }
	);
	return {
		...response,
		receiptOnly: false,
		fullOutputAvailable: true,
		resolvedStateRoot: located.stateRoot,
		crossRootResolved: located.current !== true
	};
}

function receiptPage(payload, jobId, stream, located) {
	const witness = Receipt.stream(located.receipt, stream) || emptyWitness();
	const content = String(witness.text || "");
	return Context.named(payload, "commandJobOutputPage", {
		ok: true,
		jobId,
		stream,
		content,
		offsetChars: 0,
		requestedOffsetChars: Math.max(0, Number(payload.offsetChars || 0)),
		returnedChars: content.length,
		totalChars: content.length,
		hasNextPage: false,
		nextOffsetChars: null,
		jobStatus: located.receipt.meta.status,
		receiptOnly: true,
		incidentReceipt: true,
		fullOutputAvailable: false,
		outputPartial: witness.partial === true,
		originalBytes: Number(witness.originalBytes || 0),
		retainedBytes: Number(witness.retainedBytes || 0),
		omittedBytes: Number(witness.omittedBytes || 0),
		resolvedStateRoot: located.stateRoot,
		crossRootResolved: located.current !== true,
		statusPayload: { action: "commandStatus", jobId }
	});
}

function selectedStream(value) {
	return String(value || "stdout").toLowerCase() === "stderr" ? "stderr" : "stdout";
}

function emptyWitness() {
	return { text: "", originalBytes: 0, retainedBytes: 0, omittedBytes: 0, partial: false };
}

function missing(payload, error, jobId, located = {}) {
	return Context.named(payload, "commandJobOutputPage", {
		ok: false,
		error,
		jobId,
		matches: located.matches,
		searchedRoots: located.searchedRoots
	});
}

module.exports = { commandJobOutputPage, receiptPage };
