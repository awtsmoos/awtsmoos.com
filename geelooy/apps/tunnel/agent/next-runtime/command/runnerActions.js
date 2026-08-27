// B"H
const Identity = require("./identity.js");
const Job = require("./job.js");
const ProcessControl = require("./processControl.js");
const ProcessGroup = require("./processGroup.js");
const ProcessObserve = require("./processObserve.js");
const Monitor = require("./spawnMonitor.js");
const H = require("./runnerHelpers.js");

async function launch(context, job) {
	const ticket = context.admission.acquire(job.jobId);
	if (!ticket.ok) return;
	try {
		H.transitionJob(job, "spawning", "capacity_acquired");
		const spawned = ProcessGroup.spawnGroup(job);
		job.runtime.child = spawned.child;
		job.runtime.monitor = Monitor.createSpawnMonitor(spawned.child, job.output);
		const observed = await ProcessObserve.observeProcessAsync(spawned.pid);
		job.runtime.processIdentity = Identity.processIdentity({
			pid: spawned.pid,
			processGroupId: spawned.processGroupId,
			birthToken: observed.birthToken
		});
		job.startedAt = new Date().toISOString();
		H.transitionJob(job, "running", "process_spawned");
		context.registry.register({ workerId: job.workerId, jobId: job.jobId, pid: spawned.pid, state: "running" });
		job.runtime.timer = setTimeout(() => timeout(context, job), job.timeoutMs);
		job.runtime.timer.unref?.();
		if (job.runtime.cancelRequested) void cancel(context, job.jobId);
		job.runtime.monitor.promise.then(result => finishFromMonitor(context, job, result));
	} catch (error) {
		await H.settleJob(job, "failed", { reason: "spawn_failed", error: error.message }, context);
	}
}

async function finishFromMonitor(context, job, result) {
	if (job.runtime.finalizing) return job.runtime.finalizing;
	const terminal = H.terminalFromMonitor(result);
	return H.settleJob(job, terminal.state, { ...terminal, reason: "process_closed" }, context);
}

async function cancel(context, jobId) {
	const job = context.jobs.get(String(jobId || ""));
	if (!job) return { ok: false, error: "job_not_found" };
	if (job.runtime.finalizing) return job.runtime.finalizing;
	job.runtime.cancelRequested = true;
	if (job.status === "created") {
		context.queue.remove(job.ownerId, queuedJobId => queuedJobId === job.jobId);
		return H.settleJob(job, "cancelled", { reason: "cancelled_while_queued", cleanup: notStartedCleanup() }, context);
	}
	if (job.status === "spawning") return Job.publicJob(job);
	H.transitionJob(job, "cancelling", "cancel_requested");
	return H.reserveSettlement(job, async () => {
		const cleanup = await ProcessControl.cleanupProcess(job.runtime.processIdentity, context.options.cleanup);
		job.cleanup = cleanup;
		return { state: cleanup.ok ? "cancelled" : cleanup.state, details: { reason: cleanup.state, cleanup } };
	}, context);
}

async function timeout(context, job) {
	if (!job || job.runtime.finalizing) return;
	return H.reserveSettlement(job, async () => {
		const cleanup = await ProcessControl.cleanupProcess(job.runtime.processIdentity, context.options.cleanup);
		job.cleanup = cleanup;
		return { state: cleanup.ok ? "timed_out" : cleanup.state, details: { reason: "timeout", cleanup } };
	}, context);
}

function notStartedCleanup() {
	return { ok: true, state: "not_started", signals: [], at: new Date().toISOString() };
}

module.exports = { cancel, finishFromMonitor, launch, notStartedCleanup, timeout };
