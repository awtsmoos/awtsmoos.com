// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Deadline = require("./promiseDeadline.js");
const Identity = require("./processIdentity.js");
const Lifecycle = require("./lifecycle.js");
const Locator = require("./jobLocator.js");
const ReceiptLocator = require("./receiptLocator.js");
const Response = require("./cancelResponse.js");
const Scheduler = require("./scheduler.js");

/**
 * @file Cancels stored command work through the same complete root-family witness used by status and output.
 * @description The Awtsmoos never lets a project-root crossing hide durable work;
 * Awtsmoos.com treats compact terminal receipts as history only and never sends cleanup toward a vanished process.
 */
async function cancelStored(config, payload, jobId) {
	const located = await Locator.locate(config, jobId);
	if (!located.ok) return missingFullJob(config, payload, jobId, located);
	const location = locationFields(located);
	let meta = located.meta;
	if (Context.Policy.TERMINAL.has(meta.status)) {
		return Response.terminalCancel(payload, jobId, meta, {
			...location,
			cancelled: meta.status === "cancelled",
			alreadyTerminal: true
		});
	}
	if (meta.status === "queued") {
		return cancelQueued(located.config, payload, jobId, meta, location);
	}
	const cleanup = await cleanupStored(meta);
	meta = await Lifecycle.finalizeDetached(located.config, jobId, meta, {
		status: cleanup.ok ? "cancelled" : cleanup.state,
		cancelled: cleanup.ok,
		detachedRecovered: true,
		cleanup
	});
	return Response.terminalCancel(payload, jobId, meta, {
		...location,
		cancelled: meta.status === "cancelled",
		detachedRecovered: true
	});
}

async function missingFullJob(config, payload, jobId, located) {
	if (located.error !== "job_not_found_or_expired") {
		return lookupError(payload, jobId, located);
	}
	const receipt = await ReceiptLocator.locate(config, jobId);
	if (receipt.ok) {
		return Response.terminalCancel(payload, jobId, receipt.receipt.meta, {
			...locationFields(receipt),
			cancelled: receipt.receipt.meta.status === "cancelled",
			alreadyTerminal: true,
			receiptOnly: true,
			incidentReceipt: true,
			fullOutputAvailable: false
		});
	}
	if (receipt.error !== "receipt_not_found") return lookupError(payload, jobId, receipt);
	return Response.missing(payload, jobId);
}

async function cleanupStored(meta) {
	const outcome = await Deadline.settle(
		() => Context.ProcessControl.cleanup(Identity.fromMeta(meta), Lifecycle.cleanupOptions()),
		4000,
		"stored_worker_cleanup"
	);
	return outcome.ok ? outcome.value : {
		ok: false,
		state: "cleanup_failed",
		error: outcome.error
	};
}

async function cancelQueued(config, payload, jobId, meta, location = {}) {
	Scheduler.cancelQueued(jobId);
	const cleanup = { ok: true, state: "not_started", signals: [], at: new Date().toISOString() };
	const finalMeta = await Lifecycle.finalizeDetached(config, jobId, meta, {
		status: "cancelled",
		cancelled: true,
		cleanup
	});
	return Response.terminalCancel(payload, jobId, finalMeta, {
		...location,
		cancelled: true,
		queued: true
	});
}

function locationFields(located) {
	return {
		resolvedStateRoot: located.stateRoot,
		crossRootResolved: located.current !== true
	};
}

function lookupError(payload, jobId, located) {
	return Context.named(payload, "commandCancel", {
		ok: false,
		error: located.error,
		jobId,
		matches: located.matches,
		searchedRoots: located.searchedRoots
	});
}

module.exports = { cancelQueued, cancelStored, cleanupStored, locationFields };
