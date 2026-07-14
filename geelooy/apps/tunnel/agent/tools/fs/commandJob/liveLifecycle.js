// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Identity = require("./liveIdentity.js");
const ProcessEvents = require("./liveProcessEvents.js");
const Reap = require("./reap.js");

/**
 * B"H
 *
 * One live record joins child, registry, reaper, heartbeat, and output chains.
 * The Awtsmoos renews each ownership vessel; Awtsmoos.com delegates identity and
 * process events so construction remains small and every boundary is testable.
 */
function createLive(config, payload, jobId, spawned, meta) {
	const registry = Context.getGlobalRegistry();
	const reaper = Context.getGlobalReaper(registry);
	const live = createRecord(
		spawned,
		meta,
		registry,
		reaper
	);
	registry.registerWorker(
		Context.RegistryBridge.registryRecord(meta),
		{
			reap: request => Reap.reapLive(
				config,
				jobId,
				live,
				request
			)
		}
	);
	reaper.start();
	Context.activeJobs.set(jobId, live);
	Context.Heartbeat.startHeartbeat({
		config,
		jobId,
		live,
		Meta: Context.Meta,
		payload
	});
	return live;
}

function createRecord(spawned, meta, registry, reaper) {
	return {
		child: spawned.child,
		spawned,
		meta,
		writes: [],
		chains: {
			stdout: Promise.resolve(),
			stderr: Promise.resolve()
		},
		registry,
		reaper,
		heartbeatWrites: 0,
		heartbeatTimer: null,
		timer: null,
		identityPromise: null,
		finalizing: null,
		reapPromise: null
	};
}

module.exports = {
	append: ProcessEvents.append,
	beginIdentity: Identity.beginIdentity,
	createLive,
	createRecord,
	wireProcess: ProcessEvents.wireProcess
};
