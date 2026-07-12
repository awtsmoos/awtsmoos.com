// B"H
const Context = require('./context.js');
const Lifecycle = require('./lifecycle.js');

/** B"H — Launch transforms queued intent into one isolated process family. */
async function launch(config, payload, meta) {
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
	await Context.Meta.write(config, meta.jobId, meta);
	const live = Lifecycle.createLive(config, payload, meta.jobId, spawned, meta);
	Lifecycle.wireProcess(config, meta.jobId, live, meta.timeoutMs);
	await Lifecycle.beginIdentity(config, meta.jobId, live);
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
	return Lifecycle.finalizeDetached(config, meta.jobId, meta, {
		status: 'failed',
		error: error.message,
		launchFailed: true
	});
}

module.exports = { fail, launch };
