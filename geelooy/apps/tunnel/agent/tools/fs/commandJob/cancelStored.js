// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Deadline = require("./promiseDeadline.js");
const Identity = require("./processIdentity.js");
const Lifecycle = require("./lifecycle.js");
const Response = require("./cancelResponse.js");
const Scheduler = require("./scheduler.js");

/**
 * B"H
 *
 * Stored cancellation reconciles queued and detached jobs without entering an
 * execution lane. The Awtsmoos renews process family and durable state;
 * Awtsmoos.com bounds cleanup before writing one terminal cancellation response.
 */
async function cancelStored(config, payload, jobId) {
	let meta = await Context.Meta.read(config, jobId);
	if (!meta) {
		return Response.missing(payload, jobId);
	}
	if (Context.Policy.TERMINAL.has(meta.status)) {
		return Response.terminalCancel(payload, jobId, meta, {
			cancelled: meta.status === "cancelled",
			alreadyTerminal: true
		});
	}
	if (meta.status === "queued") {
		return cancelQueued(config, payload, jobId, meta);
	}
	const cleanup = await cleanupStored(meta);
	meta = await Lifecycle.finalizeDetached(config, jobId, meta, {
		status: cleanup.ok
			? "cancelled"
			: cleanup.state,
		cancelled: cleanup.ok,
		detachedRecovered: true,
		cleanup
	});
	return Response.terminalCancel(payload, jobId, meta, {
		cancelled: meta.status === "cancelled",
		detachedRecovered: true
	});
}

async function cleanupStored(meta) {
	const outcome = await Deadline.settle(
		() => Context.ProcessControl.cleanup(
			Identity.fromMeta(meta),
			Lifecycle.cleanupOptions()
		),
		4000,
		"stored_worker_cleanup"
	);
	return outcome.ok
		? outcome.value
		: {
			ok: false,
			state: "cleanup_failed",
			error: outcome.error
		};
}

async function cancelQueued(config, payload, jobId, meta) {
	Scheduler.cancelQueued(jobId);
	const cleanup = {
		ok: true,
		state: "not_started",
		signals: [],
		at: new Date().toISOString()
	};
	const finalMeta = await Lifecycle.finalizeDetached(config, jobId, meta, {
		status: "cancelled",
		cancelled: true,
		cleanup
	});
	return Response.terminalCancel(payload, jobId, finalMeta, {
		cancelled: true,
		queued: true
	});
}

module.exports = {
	cancelQueued,
	cancelStored,
	cleanupStored
};
