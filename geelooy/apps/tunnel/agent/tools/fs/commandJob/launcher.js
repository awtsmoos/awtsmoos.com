// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Lifecycle = require("./lifecycle.js");

/**
 * @file Launches admitted commands and records whether failure happened before process birth.
 * @description
 * The Awtsmoos distinguishes a queue promise that expired from a child that failed
 * to breathe; Awtsmoos.com keeps both terminal truths without inventing process cleanup for an unstarted deed.
 */
async function launch(config, payload, meta) {
	Context.MetaFactory.markLaunched(meta);
	const spawned = Context.ProcessControl.spawn(
		meta.command,
		meta.cwd,
		meta.shell,
		{ env: payload.env || {} }
	);
	Context.ProcessControl.renice(spawned, payload);
	Context.MetaFactory.attachPreliminary(meta, Context.ProcessControl.preliminary(spawned));
	const live = Lifecycle.createLive(config, payload, meta.jobId, spawned, meta);
	Lifecycle.wireProcess(config, meta.jobId, live, meta.timeoutMs);
	Lifecycle.beginIdentity(config, meta.jobId, live);
	const saved = await Context.Meta.write(config, meta.jobId, meta);
	if (!Context.Policy.TERMINAL.has(saved.status)) live.meta.revision = saved.revision;
	return startReceipt(meta, live);
}

/** Returns observable custody immediately; exact birth-token enrichment remains asynchronous. */
function startReceipt(meta, live) {
	return Context.Responses.start(meta.jobId, {
		command: meta.command,
		cwd: meta.cwd,
		shell: meta.shell,
		timeoutMs: meta.timeoutMs,
		storage: meta.storage,
		meta: live.meta
	});
}

async function fail(config, meta, error) {
	const queueTimeout = error?.code === "COMMAND_QUEUE_START_TIMEOUT";
	return Lifecycle.finalizeDetached(config, meta.jobId, meta, queueTimeout
		? {
			status: "failed",
			error: "command_queue_start_timed_out",
			consumerStarted: false,
			launchFailed: false,
			queueStartTimedOut: true,
			queueWaitMs: Math.max(0, Number(error.queueWaitMs || 0))
		}
		: {
			status: "failed",
			error: error?.message || String(error),
			launchFailed: true
		});
}

module.exports = {
	fail,
	launch,
	startReceipt
};
