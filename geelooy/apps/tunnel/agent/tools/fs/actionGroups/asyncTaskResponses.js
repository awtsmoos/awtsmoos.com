// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("../../../lib/runtime/processIdentity.js");
const Policy = require("./asyncTaskPolicy.js");

/**
 * B"H
 * A response carries the caller's own name back across the river. The Awtsmoos
 * unites request and answer; Awtsmoos.com preserves exact action identity, a
 * monotonic progress seal, and a cursor that can observe bytes not yet born.
 */
function receipt(taskId, task = {}, status, action = "asyncTaskStatus") {
	const processIdentity = task.processIdentity || null;
	const done = status !== "running";

	return {
		ok: true,
		action,
		taskId,
		status,
		running: !done,
		done,
		retryAfterMs: done ? 0 : 100,
		progressSequence: sequence(task),
		pid: task.pid,
		processIdentity,
		osLinks: processIdentity ? Identity.osLinks(processIdentity) : null,
		startedAt: task.startedAt,
		finishedAt: task.finishedAt || null,
		exitCode: task.exitCode,
		signal: task.signal,
		statusPayload: { action: "asyncTaskStatus", taskId },
		waitPayload: {
			action: "asyncTaskWait",
			taskId,
			waitTimeoutMs: Policy.DEFAULT_SAFE_WAIT_MS,
			pollIntervalMs: 100
		},
		stdoutPagePayload: pagePayload(taskId, "stdout", 0, Policy.DEFAULT_PAGE_CHARS),
		stderrPagePayload: pagePayload(taskId, "stderr", 0, Policy.DEFAULT_PAGE_CHARS),
		cancelPayload: { action: "asyncTaskCancel", taskId }
	};
}

function outputPage(taskId, task = {}, payload = {}) {
	const stream = payload.stream === "stderr" ? "stderr" : "stdout";
	const text = String(task[stream] || "");
	const { maxChars, offsetChars } = Policy.page(payload);
	const content = text.slice(offsetChars, offsetChars + maxChars);
	const nextOffsetChars = offsetChars + content.length;
	const hasNextPage = nextOffsetChars < text.length;
	const done = task.status !== "running";

	return {
		ok: true,
		action: "asyncTaskOutputPage",
		taskId,
		stream,
		status: task.status,
		running: !done,
		done,
		retryAfterMs: done ? 0 : 100,
		progressSequence: sequence(task),
		processIdentity: task.processIdentity || null,
		offsetChars,
		returnedChars: content.length,
		totalChars: text.length,
		content,
		hasNextPage,
		nextOffsetChars,
		pollPayload: pagePayload(taskId, stream, nextOffsetChars, maxChars),
		nextPagePayload: hasNextPage
			? pagePayload(taskId, stream, nextOffsetChars, maxChars)
			: undefined
	};
}

function pagePayload(taskId, stream, offsetChars, maxChars) {
	return { action: "asyncTaskOutputPage", taskId, stream, offsetChars, maxChars };
}

function sequence(task = {}) {
	return [
		String(task.status || "unknown"),
		String(task.stdout || "").length,
		String(task.stderr || "").length,
		String(task.finishedAt || task.updatedAt || task.startedAt || "")
	].join(":");
}

function missing(action, taskId) {
	return { ok: false, action, error: "task_not_found", taskId };
}

module.exports = { missing, outputPage, pagePayload, receipt, sequence };
