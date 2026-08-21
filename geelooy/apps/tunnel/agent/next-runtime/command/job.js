// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const Output = require("./outputCounters.js");

/**
 * @file Creates isolated command jobs only after stable owner identity exists.
 * @description
 * The Awtsmoos names the messenger before the subprocess receives breath. Awtsmoos.com
 * refuses anonymous job ownership so cancellation, limits, telemetry, and fairness can
 * always return to the exact logical or request identity that created the command.
 */
function createJob(input = {}, options = {}) {
	const now = new Date().toISOString();
	const ownerId = commandOwner(input);
	let resolveDone;
	const done = new Promise(resolve => { resolveDone = resolve; });
	return {
		jobId: input.jobId || nextId("cmdjob"),
		workerId: input.workerId || nextId("worker"),
		receiptId: input.receiptId || nextId("receipt"),
		ownerId,
		idempotencyKey: String(input.idempotencyKey || ""),
		commandHash: input.commandHash,
		command: String(input.command || ""),
		cwd: String(input.cwd || process.cwd()),
		shell: input.shell || true,
		env: input.env || {},
		timeoutMs: positive(input.timeoutMs, 120000),
		status: "created",
		state: "created",
		revision: 0,
		createdAt: now,
		updatedAt: now,
		history: [],
		output: Output.createOutputCounters({ maxBytes: options.maxOutputBytes }),
		runtime: { child: null, monitor: null, processIdentity: null, timer: null,
			finalizing: null, cancelRequested: false, resolveDone, done }
	};
}

function publicJob(job) {
	return { jobId: job.jobId, workerId: job.workerId, receiptId: job.receiptId,
		ownerId: job.ownerId, status: job.status, state: job.state, revision: job.revision,
		createdAt: job.createdAt, startedAt: job.startedAt || null, finishedAt: job.finishedAt || null,
		exitCode: job.exitCode ?? null, signal: job.signal || null,
		processIdentity: job.runtime.processIdentity ? structuredClone(job.runtime.processIdentity) : null,
		cleanup: job.cleanup ? structuredClone(job.cleanup) : null, output: job.output.snapshot() };
}

function commandOwner(input = {}) {
	for (const field of ["ownerId", "logicalAgentId", "agentSessionId", "controlRequestId",
		"requestId", "clientRequestId", "nonce"]) {
		const value = String(input[field] || "").trim();
		if (value) return field === "ownerId" ? value : `${field}:${value}`;
	}
	const error = new Error("missing_command_owner_identity");
	error.code = "INVALID_COMMAND_OWNER_IDENTITY";
	throw error;
}

function nextId(prefix) {
	return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(6).toString("hex")}`;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = { commandOwner, createJob, nextId, publicJob };
