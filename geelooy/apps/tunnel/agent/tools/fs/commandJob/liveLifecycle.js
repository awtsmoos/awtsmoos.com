// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Identity = require("./liveIdentity.js");
const ProcessEvents = require("./liveProcessEvents.js");
const Reap = require("./reap.js");

/**
 * @file Creates one explicit ownership record for each live command process.
 * @description
 * The Awtsmoos joins child, registry, reaper, heartbeat, and ordered output in
 * one renewed vessel. Awtsmoos.com keeps constant-time writes, one heartbeat
 * stream, and per-channel byte testimony for batched retained-output trimming.
 */
function createLive(config, payload, jobId, spawned, meta) {
	const registry = Context.getGlobalRegistry();
	const reaper = Context.getGlobalReaper(registry);
	const live = createRecord(spawned, meta, registry, reaper, config);
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

function createRecord(spawned, meta, registry, reaper, config = null) {
	return {
		child: spawned.child,
		spawned,
		meta,
		config,
		writes: new Set(),
		chains: {
			stdout: Promise.resolve(),
			stderr: Promise.resolve()
		},
		outputState: {
			stdout: streamState(),
			stderr: streamState()
		},
		registry,
		reaper,
		heartbeatWrites: 0,
		heartbeatTimer: null,
		heartbeatPersistence: null,
		timer: null,
		identityPromise: null,
		finalizing: null,
		reapPromise: null
	};
}

function streamState() {
	return {
		bytes: 0,
		trims: 0
	};
}

module.exports = {
	append: ProcessEvents.append,
	beginIdentity: Identity.beginIdentity,
	createLive,
	createRecord,
	streamState,
	wireProcess: ProcessEvents.wireProcess
};
