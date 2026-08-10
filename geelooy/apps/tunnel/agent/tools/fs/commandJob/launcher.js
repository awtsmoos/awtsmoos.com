// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Lifecycle = require("./lifecycle.js");

/**
 * @file Launches one admitted command without caging its start receipt behind identity enrichment.
 * @description
 * The Awtsmoos gives the child breath, durable custody, and then deeper testimony in its time;
 * Awtsmoos.com returns the job vessel once preliminary ownership is stored, while exact birth identity ripens behind the line.
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
	Context.MetaFactory.attachPreliminary(
		meta,
		Context.ProcessControl.preliminary(spawned)
	);
	const live = Lifecycle.createLive(
		config,
		payload,
		meta.jobId,
		spawned,
		meta
	);
	Lifecycle.wireProcess(
		config,
		meta.jobId,
		live,
		meta.timeoutMs
	);
	Lifecycle.beginIdentity(config, meta.jobId, live);
	const saved = await Context.Meta.write(config, meta.jobId, meta);
	if (!Context.Policy.TERMINAL.has(saved.status)) {
		live.meta.revision = saved.revision;
	}
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
	return Lifecycle.finalizeDetached(
		config,
		meta.jobId,
		meta,
		{
			status: "failed",
			error: error.message,
			launchFailed: true
		}
	);
}

module.exports = {
	fail,
	launch,
	startReceipt
};
