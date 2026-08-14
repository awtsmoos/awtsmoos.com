// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const { commandJobOutputPage } = require("./output.js");
const { commandStatus } = require("./status.js");

/**
 * @file Waits on durable command truth even after the caller crosses project roots.
 * @description
 * The Awtsmoos lets status reveal the exact state vessel, then Awtsmoos.com reads
 * terminal stdout and stderr from that same room rather than recomputing another root.
 */
async function commandWait(config = {}, payload = {}) {
	const jobId = Context.Policy.cleanId(payload.jobId || payload.id || "");
	if (!jobId) return missing(payload);
	const startedAt = Date.now();
	const timeoutMs = Context.Policy.boundedWaitMs(payload.waitTimeoutMs || payload.timeoutMs);
	const intervalMs = Math.max(25, Math.min(Number(payload.pollIntervalMs || 1000), 30000));
	let status = null;
	while (Date.now() - startedAt <= timeoutMs) {
		status = await commandStatus(config, statusPayload(payload, jobId));
		if (!status.ok || !Context.running(status.status)) {
			return waitDone(config, payload, jobId, status, startedAt);
		}
		await Context.Meta.sleep(intervalMs);
	}
	return waitStillRunning(payload, jobId, status, startedAt, intervalMs);
}

async function waitDone(config, payload, jobId, status, startedAt) {
	if (!status?.ok) {
		return Context.named(payload, "commandWait", {
			...status,
			done: true,
			waitedMs: Date.now() - startedAt
		});
	}
	await Context.IO.waitForWrites(jobId, Context.activeJobs);
	const maxChars = Context.Policy.boundedPageChars(payload.maxChars || Context.Policy.DEFAULT_PAGE_CHARS);
	const inlineOutput = payload.inlineOutput !== false;
	const locatedConfig = status.resolvedStateRoot
		? { ...config, commandStateRoot: status.resolvedStateRoot }
		: config;
	const stdout = inlineOutput ? await output(locatedConfig, jobId, "stdout", maxChars) : null;
	const stderr = inlineOutput ? await output(locatedConfig, jobId, "stderr", maxChars) : null;
	return Context.named(payload, "commandWait", {
		...status,
		done: true,
		waitedMs: Date.now() - startedAt,
		stdout,
		stderr
	});
}

function output(config, jobId, stream, maxChars) {
	return commandJobOutputPage(config, { jobId, stream, maxChars });
}

function statusPayload(payload, jobId) {
	return {
		...payload,
		jobId,
		action: "commandStatus",
		requestAction: "commandStatus",
		actualAction: "commandStatus"
	};
}

function waitStillRunning(payload, jobId, status, startedAt, intervalMs) {
	return Context.named(payload, "commandWait", {
		ok: true,
		status: status?.status || "running",
		done: false,
		waitTimedOut: true,
		waitedMs: Date.now() - startedAt,
		lastStatus: status,
		statusPayload: { action: "commandStatus", jobId },
		nextWaitPayload: {
			action: "commandWait",
			jobId,
			waitTimeoutMs: Context.Policy.commandWaitCapMs(),
			pollIntervalMs: intervalMs,
			inlineOutput: payload.inlineOutput !== false
		}
	});
}

function missing(payload) {
	return Context.named(payload, "commandWait", {
		ok: false,
		error: "missing_jobId",
		status: "missing_jobId"
	});
}

module.exports = { commandWait, waitDone, waitStillRunning };
