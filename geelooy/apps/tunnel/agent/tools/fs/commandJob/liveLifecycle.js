// B"H
const Context = require('./context.js');
const Finalization = require('./finalization.js');

/** B"H — One live record owns child, identity, writes, heartbeat, and settlement. */
function createLive(config, payload, jobId, spawned, meta) {
	const registry = Context.getGlobalRegistry();
	registry.registerWorker(Context.RegistryBridge.registryRecord(meta));
	const live = {
		child: spawned.child,
		spawned,
		meta,
		writes: [],
		chains: { stdout: Promise.resolve(), stderr: Promise.resolve() },
		registry,
		heartbeatWrites: 0,
		heartbeatTimer: null,
		timer: null,
		identityPromise: null,
		finalizing: null
	};
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
			Context.MetaFactory.attachProcess(live.meta, identity, 'running');
			live.registry.updateWorker(live.meta.workerId, {
				state: 'running',
				pid: identity.pid,
				processGroupId: identity.processGroupId,
				birthToken: identity.birthToken,
				platform: identity.platform,
				heartbeatAt: live.meta.heartbeatAt || live.meta.startedAt
			});
			const saved = await Context.Meta.write(config, jobId, live.meta);
			if (!Context.Policy.TERMINAL.has(saved.status)) live.meta.revision = saved.revision;
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
		void Finalization.reserve(config, jobId, live, async () => {
			const identity = await live.identityPromise;
			const cleanup = await Context.ProcessControl.cleanup(
				identity,
				Finalization.cleanupOptions()
			);
			return {
				status: cleanup.ok ? 'timed_out' : cleanup.state,
				timedOut: true,
				cleanup
			};
		});
	}, timeoutMs);
	live.timer.unref?.();
	live.child.stdout.on('data', chunk => append(config, jobId, live, 'stdout', chunk));
	live.child.stderr.on('data', chunk => append(config, jobId, live, 'stderr', chunk));
	live.child.once('error', error => {
		void Finalization.reserve(config, jobId, live, async () => ({
			status: 'failed',
			error: error.message
		}));
	});
	live.child.once('close', (code, signal) => {
		void Finalization.reserve(config, jobId, live, async () => ({
			status: code === 0 ? 'completed' : 'failed',
			exitCode: code,
			signal
		}));
	});
}

function append(config, jobId, live, stream, chunk) {
	Context.Heartbeat.touch(live);
	Context.IO.append(config, jobId, stream, chunk, live);
}

module.exports = { append, beginIdentity, createLive, wireProcess };
