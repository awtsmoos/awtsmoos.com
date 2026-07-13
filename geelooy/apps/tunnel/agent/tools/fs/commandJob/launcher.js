// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Lifecycle = require("./lifecycle.js");

/**
 * B"H
 * The listeners enter before the event loop may announce a fast child exit.
 * Thus even an `echo` has its final breath witnessed by Awtsmoos.com, while
 * the Awtsmoos binds process identity and durable metadata into one receipt.
 */
async function launch(config, payload, meta) {
	const spawned = Context.ProcessControl.spawn(
		meta.command,
		meta.cwd,
		meta.shell,
		{
			env: payload.env || {}
		}
	);

	Context.ProcessControl.renice(
		spawned,
		payload
	);
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

	Lifecycle.beginIdentity(
		config,
		meta.jobId,
		live
	);
	Lifecycle.wireProcess(
		config,
		meta.jobId,
		live,
		meta.timeoutMs
	);

	await Context.Meta.write(
		config,
		meta.jobId,
		meta
	);
	await live.identityPromise;

	return Context.Responses.start(
		meta.jobId,
		{
			command: meta.command,
			cwd: meta.cwd,
			shell: meta.shell,
			timeoutMs: meta.timeoutMs,
			storage: meta.storage,
			meta: live.meta
		}
	);
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
