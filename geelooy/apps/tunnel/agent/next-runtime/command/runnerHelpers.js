// B"H
const Job = require("./job.js");
const Transitions = require("./transitions.js");

function transitionJob(job, nextState, reason) {
	const runtime = job.runtime;
	const output = job.output;
	const transitioned = Transitions.transition(job, nextState, {
		expectedRevision: job.revision,
		reason
	});
	Object.assign(job, transitioned, { runtime, output });
	return job;
}

function settleJob(job, state, details = {}, context = {}) {
	return reserveSettlement(job, async () => ({ state, details }), context);
}

function reserveSettlement(job, producer, context = {}) {
	if (job.runtime.finalizing) return job.runtime.finalizing;
	job.runtime.finalizing = Promise.resolve().then(producer).then(result => {
		return completeSettlement(job, result.state, result.details || {}, context);
	}).catch(error => failedSettlement(job, error, context));
	return job.runtime.finalizing;
}

function completeSettlement(job, state, details, context) {
	if (job.runtime.timer) clearTimeout(job.runtime.timer);
	if (!Transitions.isTerminal(job.status)) transitionJob(job, state, details.reason || state);
	Object.assign(job, details, { finishedAt: details.finishedAt || new Date().toISOString() });
	releaseOwnership(job, context);
	const publicResult = Job.publicJob(job);
	context.afterSettle?.(job, publicResult);
	job.runtime.resolveDone(publicResult);
	return publicResult;
}

function failedSettlement(job, error, context) {
	if (job.runtime.timer) clearTimeout(job.runtime.timer);
	if (!Transitions.isTerminal(job.status)) {
		try { transitionJob(job, "failed", "settlement_error"); }
		catch { Object.assign(job, { status: "failed", state: "failed", revision: job.revision + 1 }); }
	}
	job.error = error.message;
	job.finishedAt = new Date().toISOString();
	releaseOwnership(job, context);
	const result = Job.publicJob(job);
	context.afterSettle?.(job, result);
	job.runtime.resolveDone(result);
	return result;
}

function releaseOwnership(job, context) {
	context.registry?.finish(job.workerId, { state: job.status, jobId: job.jobId });
	context.admission?.release(job.jobId);
	if (job.idempotencyKey) context.idempotency?.update(job.idempotencyKey, {
		state: job.status,
		jobId: job.jobId,
		result: Job.publicJob(job)
	});
}

function terminalFromMonitor(result) {
	if (result.kind === "error") return { state: "failed", error: result.error?.message || "spawn_error" };
	return result.code === 0
		? { state: "completed", exitCode: 0, signal: result.signal }
		: { state: "failed", exitCode: result.code, signal: result.signal };
}

module.exports = { reserveSettlement, settleJob, terminalFromMonitor, transitionJob };
