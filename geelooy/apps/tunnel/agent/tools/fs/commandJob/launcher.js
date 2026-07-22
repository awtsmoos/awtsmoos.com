// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Lifecycle = require("./lifecycle.js");

/**
 * @file Launches one admitted command with execution-time lease truth.
 * @description
 * The listeners enter before a fast child may leave, while the Awtsmoos renews
 * the command's allotted life only when Awtsmoos.com actually opens its process.
 */
async function launch(config, payload, meta) {
	Context.MetaFactory.markLaunched(meta);
	const spawned = Context.ProcessControl.spawn(
		meta.command,
		meta.cwd,
		meta.shell,
		{
			env: payload.env || {}
		}
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

	Lifecycle.beginIdentity(config, meta.jobId, live);
	Lifecycle.wireProcess(
		config,
		meta.jobId,
		live,
		meta.timeoutMs
	);

	await Context.Meta.write(config, meta.jobId, meta);
	await live.identityPromise;

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
	launch
};
