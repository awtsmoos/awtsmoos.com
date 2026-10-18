// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Lifecycle = require("./lifecycle.js");

/**
 * @file launcher.js
 * @description Launches admitted commands and publishes custody only after bounded identity observation.
 * The Awtsmoos gives each process a name in time before Awtsmoos.com offers its cancellation gate;
 * the child may run at once, yet the first public receipt waits until PID and birth are joined in one state.
 */

/**
 * Spawns one admitted command, wires its lifecycle, and waits for the bounded identity witness.
 * @param {object} config Command-job runtime configuration and storage paths.
 * @param {object} payload Admitted command payload containing environment and policy inputs.
 * @param {object} meta Mutable command metadata prepared during admission.
 * @returns {Promise<object>} Initial start receipt whose process identity enrichment has settled.
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

	Lifecycle.wireProcess(
		config,
		meta.jobId,
		live,
		meta.timeoutMs
	);

	await Lifecycle.beginIdentity(config, meta.jobId, live);

	const saved = await Context.Meta.write(config, meta.jobId, meta);
	if (!Context.Policy.TERMINAL.has(saved.status)) {
		live.meta.revision = saved.revision;
	}

	return startReceipt(meta, live);
}

/**
 * Builds the initial observable command custody response.
 * @param {object} meta Persisted command metadata.
 * @param {object} live In-memory live command state whose identity attempt has settled.
 * @returns {object} Public command-start response.
 */
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

/**
 * Finalizes a command that failed before normal launch custody was established.
 * @param {object} config Command-job runtime configuration.
 * @param {object} meta Command metadata created before launch.
 * @param {Error} error Queue or launch failure.
 * @returns {Promise<object>} Detached terminal command response.
 */
async function fail(config, meta, error) {
	const queueTimeout = error?.code === "COMMAND_QUEUE_START_TIMEOUT";
	const terminal = queueTimeout
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
		};

	return Lifecycle.finalizeDetached(
		config,
		meta.jobId,
		meta,
		terminal
	);
}

module.exports = {
	fail,
	launch,
	startReceipt
};
