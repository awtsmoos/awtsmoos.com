// B"H
const Context = require('./context.js');

/**
 * B"H — Every child reaches one final doorway; timers, output chains, heartbeat,
 * registry ownership, and active handles are released before the receipt closes.
 */
function createLive(config, payload, jobId, child, meta) {
	const registry = Context.getGlobalRegistry();
	registry.registerWorker(Context.RegistryBridge.registryRecord(meta, child.pid));
	const live = {
		child,
		meta,
		writes: [],
		chains: { stdout: Promise.resolve(), stderr: Promise.resolve() },
		registry,
		heartbeatWrites: 0
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

function wireProcess(config, jobId, child, meta, live, timeoutMs) {
	const timer = setTimeout(() => {
		meta.timedOut = true;
		Context.ProcessControl.kill(child);
	}, timeoutMs);
	timer.unref?.();
	child.stdout.on('data', chunk => {
		Context.Heartbeat.touch(live);
		Context.IO.append(config, jobId, 'stdout', chunk, live);
	});
	child.stderr.on('data', chunk => {
		Context.Heartbeat.touch(live);
		Context.IO.append(config, jobId, 'stderr', chunk, live);
	});
	child.on('error', error => {
		void finishJob(config, jobId, meta, {
			status: 'failed',
			error: error.message,
			timer
		});
	});
	child.on('close', (code, signal) => {
		void finishJob(config, jobId, meta, {
			status: Context.closeStatus(meta, code),
			exitCode: code,
			signal,
			timer
		});
	});
}

async function finishJob(config, jobId, meta, patch = {}) {
	clearTimeout(patch.timer);
	const live = Context.activeJobs.get(jobId);
	Context.Heartbeat.stop(live);
	await Context.IO.waitForWrites(jobId, Context.activeJobs);
	const current = await Context.Meta.read(config, jobId);
	const base = current && Context.Policy.TERMINAL.has(current.status)
		? current
		: meta;
	const finalMeta = await Context.refreshCounts(
		config,
		jobId,
		Context.Finalize.finalizeMeta({
			...base,
			...patch,
			finishedAt: base.finishedAt || new Date().toISOString()
		})
	);
	delete finalMeta.timer;
	await Context.Meta.write(config, jobId, finalMeta);
	Context.RegistryBridge.finishRegistry(live?.registry, finalMeta);
	Context.activeJobs.delete(jobId);
	Context.GarbageCollection.collect(config).catch(() => {});
	return finalMeta;
}

async function finalizeDetached(config, jobId, meta, patch = {}) {
	const finalMeta = await Context.refreshCounts(
		config,
		jobId,
		Context.Finalize.finalizeMeta({
			...meta,
			...patch,
			finishedAt: meta.finishedAt || new Date().toISOString(),
			worker: { ...(meta.worker || {}), state: patch.status, detached: true },
			receipt: {
				...(meta.receipt || {}),
				state: patch.status,
				updatedAt: new Date().toISOString()
			}
		})
	);
	await Context.Meta.write(config, jobId, finalMeta);
	return finalMeta;
}

module.exports = { createLive, finalizeDetached, finishJob, wireProcess };
