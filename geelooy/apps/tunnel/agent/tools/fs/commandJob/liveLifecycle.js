// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Finalization = require("./finalization.js");
const Reap = require("./reap.js");

/**
 * B"H
 *
 * One live record owns child, identity, output, heartbeat, and a private reap
 * callback. The Awtsmoos renews every worker; Awtsmoos.com lets timeout and
 * cancellation leave the execution scheduler before cleanup or storage awaits.
 */
function createLive(config, payload, jobId, spawned, meta) {
	const registry = Context.getGlobalRegistry();
	const reaper = Context.getGlobalReaper(registry);
	const live = {
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

function beginIdentity(config, jobId, live) {
	live.identityPromise = Context.ProcessControl.identify(live.spawned)
		.then(async identity => {
			Context.MetaFactory.attachProcess(
				live.meta,
				identity,
				"running"
			);
			live.registry.updateWorker(live.meta.workerId, {
				state: "running",
				pid: identity.pid,
				processGroupId: identity.processGroupId,
				birthToken: identity.birthToken,
				platform: identity.platform,
				heartbeatAt: live.meta.heartbeatAt || live.meta.startedAt
			});
			const saved = await Context.Meta.write(config, jobId, live.meta);
			if (!Context.Policy.TERMINAL.has(saved.status)) {
				live.meta.revision = saved.revision;
			}
			return identity;
		})
		.catch(error => {
			live.meta.identityError = error.message;
			return live.meta.processIdentity;
		});
	return live.identityPromise;
}

function wireProcess(config, jobId, live, timeoutMs) {
	live.timer = setTimeout(() => {
		void live.reaper.reapWorker(live.meta.workerId, {
			reason: "command_timeout",
			status: "timed_out",
			error: `command_timeout:${timeoutMs}`
		});
	}, timeoutMs);
	live.timer.unref?.();
	live.child.stdout.on("data", chunk => append(
		config,
		jobId,
		live,
		"stdout",
		chunk
	));
	live.child.stderr.on("data", chunk => append(
		config,
		jobId,
		live,
		"stderr",
		chunk
	));
	live.child.once("error", error => {
		void Finalization.reserve(config, jobId, live, async () => ({
			status: "failed",
			error: error.message
		}));
	});
	live.child.once("close", (code, signal) => {
		void Finalization.reserve(config, jobId, live, async () => ({
			status: code === 0 ? "completed" : "failed",
			exitCode: code,
			signal
		}));
	});
}

function append(config, jobId, live, stream, chunk) {
	Context.Heartbeat.touch(live);
	Context.IO.append(config, jobId, stream, chunk, live);
}

module.exports = {
	append,
	beginIdentity,
	createLive,
	wireProcess
};
