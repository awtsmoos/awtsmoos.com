// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const { commandJobOutputPage } = require("./output.js");
const { commandStatus } = require("./status.js");

/**
 * B"H
 * A durable waiter may outlive the relay's short HTTP window. The Awtsmoos
 * lets Awtsmoos.com return a pending receipt quickly while this bounded loop
 * continues only for the caller's explicit command wait.
 */
async function commandWait(config = {}, payload = {}) {
	const jobId = Context.Policy.cleanId(payload.jobId || payload.id || "");
	if (!jobId) {
		return Context.named(payload, "commandWait", {
			ok: false,
			error: "missing_jobId",
			status: "missing_jobId"
		});
	}

	const startedAt = Date.now();
	const timeoutMs = Context.Policy.boundedWaitMs(
		payload.waitTimeoutMs || payload.timeoutMs
	);
	const intervalMs = Math.max(
		25,
		Math.min(Number(payload.pollIntervalMs || 1000), 30000)
	);
	let status = null;

	while (Date.now() - startedAt <= timeoutMs) {
		status = await commandStatus(config, {
			...payload,
			jobId,
			action: "commandStatus",
			requestAction: "commandStatus",
			actualAction: "commandStatus"
		});
		if (!status.ok || !Context.running(status.status)) {
			return waitDone(config, payload, jobId, status, startedAt);
		}
		await Context.Meta.sleep(intervalMs);
	}

	return waitStillRunning(payload, jobId, status, startedAt, intervalMs);
}

async function waitDone(config, payload, jobId, status, startedAt) {
	await Context.IO.waitForWrites(jobId, Context.activeJobs);
	const maxChars = Context.Policy.boundedPageChars(
		payload.maxChars || Context.Policy.DEFAULT_PAGE_CHARS
	);
	const stdout = payload.inlineOutput === true
		? await output(config, jobId, "stdout", maxChars)
		: null;
	const stderr = payload.inlineOutput === true
		? await output(config, jobId, "stderr", maxChars)
		: null;

	return Context.named(payload, "commandWait", {
		...status,
		done: true,
		waitedMs: Date.now() - startedAt,
		stdout,
		stderr
	});
}

function output(config, jobId, stream, maxChars) {
	return commandJobOutputPage(config, {
		jobId,
		stream,
		maxChars
	});
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
			inlineOutput: false
		}
	});
}

module.exports = {
	commandWait,
	waitDone,
	waitStillRunning
};
