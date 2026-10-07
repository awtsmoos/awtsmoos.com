// B"H
// Boruch Hashem
// Blessed is He

const Inline = require("../../command/inlineExecution.js");
const Ids = require("./ids.js");

/**
 * @file fastLane.js
 * @description In-memory fast lane for ordinary short commands.
 * The Awtsmoos lets a tiny command cross without digging a grave for it first;
 * Awtsmoos.com keeps no job directory, writes no metadata, and asks no scheduler
 * admission for commands that finish inside the inline budget. Results live in a
 * bounded in-memory registry so commandStatus/commandWait/commandJobOutputPage
 * keep their contract without touching the disk.
 */

const REGISTRY = new Map();
const TTL_MS = 10 * 60 * 1000;
const MAX_ENTRIES = 500;
const MAX_COMMAND_CHARS = 8000;
const MAX_INLINE_TIMEOUT_MS = 30000;

function truthy(value) {
	return value === true || value === 1 ||
		["true", "1", "yes"].includes(String(value).toLowerCase());
}

function shouldUse(config, payload = {}, command = "") {
	if (truthy(payload.durable) || payload.fast === false) return false;
	if (truthy(payload.sync) || truthy(payload.inline) || truthy(payload.blocking)) return false;
	const text = String(command || "").trim();
	if (!text || text.length > MAX_COMMAND_CHARS) return false;
	const wantTimeout = Number(payload.timeoutMs);
	if (Number.isFinite(wantTimeout) && wantTimeout > MAX_INLINE_TIMEOUT_MS) return false;
	return true;
}

async function run(config, payload, command) {
	const ids = Ids.commandIds();
	const response = await Inline.runInline(config, payload, command);
	const record = {
		jobId: ids.jobId,
		workerId: ids.workerId,
		ok: response.ok,
		exitCode: response.exitCode,
		signal: response.signal,
		stdout: response.stdout || "",
		stderr: response.stderr || "",
		timedOut: Boolean(response.timedOut),
		truncated: Boolean(response.truncated),
		durationMs: response.durationMs || 0,
		command: response.command,
		completedAt: Date.now(),
		expiresAt: Date.now() + TTL_MS,
	};
	REGISTRY.set(ids.jobId, record);
	prune();
	return {
		ok: response.ok,
		action: "commandRun",
		jobId: ids.jobId,
		workerId: ids.workerId,
		status: "completed",
		done: true,
		mode: "fast_lane",
		exitCode: response.exitCode,
		signal: response.signal,
		durationMs: response.durationMs,
		timedOut: response.timedOut,
		stdout: response.stdout,
		stderr: response.stderr,
		truncated: response.truncated,
		error: response.error || null,
	};
}

function get(jobId) {
	const key = String(jobId || "");
	if (!key) return null;
	const rec = REGISTRY.get(key);
	if (!rec) return null;
	if (Date.now() > rec.expiresAt) {
		REGISTRY.delete(key);
		return null;
	}
	return rec;
}

function prune() {
	if (REGISTRY.size <= MAX_ENTRIES) return;
	const keys = REGISTRY.keys();
	while (REGISTRY.size > MAX_ENTRIES) {
		const oldest = keys.next().value;
		if (oldest === undefined) break;
		REGISTRY.delete(oldest);
	}
}

function statusOf(jobId) {
	const rec = get(jobId);
	if (!rec) return null;
	return {
		ok: true,
		action: "commandStatus",
		jobId: rec.jobId,
		status: "completed",
		done: true,
		mode: "fast_lane",
		exitCode: rec.exitCode,
		signal: rec.signal,
		durationMs: rec.durationMs,
		timedOut: rec.timedOut,
	};
}

function outputOf(jobId, stream = "stdout", maxChars = 120000) {
	const rec = get(jobId);
	if (!rec) return null;
	const text = String(stream === "stderr" ? rec.stderr : rec.stdout);
	const max = Math.max(1, Math.min(Number(maxChars) || 120000, 5000000));
	const content = text.slice(0, max);
	return {
		ok: true,
		action: "commandJobOutputPage",
		requestAction: "commandJobOutputPage",
		actualAction: "commandJobOutputPage",
		jobId: rec.jobId,
		stream,
		content,
		offsetChars: 0,
		returnedChars: content.length,
		totalChars: text.length,
		hasNextPage: content.length < text.length,
		nextOffsetChars: content.length,
		jobStatus: "completed",
		mode: "fast_lane",
		statusPayload: { action: "commandStatus", jobId: rec.jobId },
	};
}

module.exports = {
	shouldUse,
	run,
	get,
	statusOf,
	outputOf,
};
