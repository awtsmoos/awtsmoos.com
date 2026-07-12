// B"H
const Identity = require("./identity.js");
const Job = require("./job.js");
const Actions = require("./runnerActions.js");
const H = require("./runnerHelpers.js");
const State = require("./runnerState.js");
const Transitions = require("./transitions.js");

/**
 * B"H — The runner admits fairly while completed receipts remain retrievable
 * without retaining child handles, timers, streams, or unbounded job objects.
 */
function createCommandRunner(options = {}) {
	const context = State.create(options);
	context.afterSettle = (job, result) => {
		State.retain(context, job, result);
		pump();
	};

	function start(input = {}) {
		if (!String(input.command || "").trim()) return { ok: false, error: "missing_command" };
		const commandIdentity = Identity.commandIdentity(input);
		const candidate = Job.createJob({ ...input, ...commandIdentity }, options);
		const keyed = context.idempotency.begin({
			idempotencyKey: candidate.idempotencyKey,
			requestHash: candidate.commandHash,
			jobId: candidate.jobId
		});
		if (!keyed.ok) return keyed;
		if (keyed.kind === "coalesced") {
			return { ok: true, kind: "coalesced", job: clone(keyed.record.result) || publicStatus(keyed.record.jobId) };
		}
		context.jobs.set(candidate.jobId, candidate);
		const queued = context.queue.enqueue(candidate.ownerId, candidate.jobId);
		if (!queued.ok) {
			context.jobs.delete(candidate.jobId);
			if (candidate.idempotencyKey) context.idempotency.remove(candidate.idempotencyKey);
			return queued;
		}
		pump();
		return { ok: true, kind: "created", job: Job.publicJob(candidate) };
	}

	function pump() {
		while (context.admission.snapshot().available > 0 && context.queue.snapshot().queued > 0) {
			const item = context.queue.dequeue();
			const job = context.jobs.get(item.item);
			if (job && !job.runtime.cancelRequested) void Actions.launch(context, job);
			else if (job) void H.settleJob(job, "cancelled", {
				reason: "cancelled_before_spawn",
				cleanup: Actions.notStartedCleanup()
			}, context);
		}
	}

	function publicStatus(jobId) {
		const value = State.status(context, jobId);
		return value?.runtime ? Job.publicJob(value) : value;
	}

	function cancel(jobId) {
		const current = publicStatus(jobId);
		if (current && Transitions.isTerminal(current.status)) return Promise.resolve(current);
		return Actions.cancel(context, jobId);
	}

	return {
		cancel,
		output: (jobId, stream, offset, maxChars) => State.output(context, jobId, stream, offset, maxChars),
		snapshot: () => State.snapshot(context),
		start,
		status: publicStatus,
		wait: jobId => State.wait(context, jobId)
	};
}

function clone(value) { return value == null ? null : structuredClone(value); }
module.exports = { createCommandRunner };
