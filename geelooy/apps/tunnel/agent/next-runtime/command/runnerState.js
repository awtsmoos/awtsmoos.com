// B"H
const Admission = require("./admission.js");
const Registry = require("./activeRegistry.js");
const FairQueue = require("./fairQueue.js");
const Idempotency = require("./idempotencyLedger.js");

/** B"H — Living handles and finished receipts dwell in separate bounded rooms. */
function create(options = {}) {
	return {
		options,
		jobs: new Map(),
		completed: new Map(),
		admission: Admission.createAdmission({ maxActive: options.maxActive }),
		registry: Registry.createActiveRegistry({ maxActive: options.maxActive, maxRecent: options.maxRecent }),
		queue: FairQueue.createFairQueue({ maxQueued: options.maxQueued, maxPerOwner: options.maxPerOwner }),
		idempotency: Idempotency.createIdempotencyLedger(options.idempotency),
		maxRetained: positive(options.maxRetained, 1024),
		afterSettle: null
	};
}

function retain(context, job, result) {
	context.completed.delete(job.jobId);
	context.completed.set(job.jobId, {
		result: clone(result),
		stdout: job.output.read("stdout", 0, Number.MAX_SAFE_INTEGER),
		stderr: job.output.read("stderr", 0, Number.MAX_SAFE_INTEGER),
		retainedAt: new Date().toISOString()
	});
	context.jobs.delete(job.jobId);
	while (context.completed.size > context.maxRetained) {
		context.completed.delete(context.completed.keys().next().value);
	}
}

function status(context, jobId) {
	const id = clean(jobId);
	const active = context.jobs.get(id);
	if (active) return active;
	const completed = context.completed.get(id);
	return completed ? clone(completed.result) : null;
}

function wait(context, jobId) {
	const id = clean(jobId);
	const active = context.jobs.get(id);
	if (active) return active.runtime.done;
	const completed = context.completed.get(id);
	return Promise.resolve(completed ? clone(completed.result) : null);
}

function output(context, jobId, streamName, offset = 0, maxChars = 12000) {
	const id = clean(jobId);
	const active = context.jobs.get(id);
	if (active) return active.output.read(streamName, offset, maxChars);
	const completed = context.completed.get(id);
	if (!completed) return null;
	const text = streamName === "stderr" ? completed.stderr : completed.stdout;
	const start = Math.max(0, Math.floor(Number(offset) || 0));
	const limit = Math.max(1, Math.floor(Number(maxChars) || 12000));
	return text.slice(start, start + limit);
}

function snapshot(context) {
	return {
		jobs: context.jobs.size + context.completed.size,
		activeJobs: context.jobs.size,
		completedResults: context.completed.size,
		maxRetained: context.maxRetained,
		admission: context.admission.snapshot(),
		registry: context.registry.snapshot(),
		queue: context.queue.snapshot(),
		idempotency: context.idempotency.snapshot()
	};
}

function clean(value) { return String(value || "").trim(); }
function clone(value) { return structuredClone(value); }
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}
module.exports = { create, output, retain, snapshot, status, wait };
