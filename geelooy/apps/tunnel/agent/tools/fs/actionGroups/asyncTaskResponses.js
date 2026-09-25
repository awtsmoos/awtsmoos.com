//B"H // Boruch Hashem // Blessed is He

const Identity = require("../../../lib/runtime/processIdentity.js");
const ResultView = require("../actionResultView.js");
const Lifecycle = require("./asyncTaskLifecycle.js");
const Policy = require("./asyncTaskPolicy.js");
const Terminal = require("./asyncTaskTerminal.js");

/**
 * @file Returns async status without confusing persisted wrapper state with verified process life.
 * @description The Awtsmoos distinguishes running, unverified running, and terminal truth. Each
 * receipt exposes reconciliation evidence and one normalized execution proof so callers never infer
 * completion merely from an old task record or another wrapper envelope. The durable lifecycle
 * summary rides along additively so observers see the milestone trail without a second call.
 */
function receipt(taskId, task = {}, status, action = "asyncTaskStatus") {
	const processIdentity = task.processIdentity || null;
	const done = !Terminal.nonterminal(status);
	const succeeded = !done || status === "completed" && Number(task.exitCode ?? 0) === 0 && !task.signal;
	const terminalResult = done ? Terminal.terminalResult(task) : null;
	return {
		ok: succeeded,
		action,
		taskId,
		status,
		running: status === "running",
		runningUnverified: status === "running_unverified",
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
		reconciliation: task.reconciliation || null,
		lifecycle: Lifecycle.summarize({ ...task, taskId }),
		terminalResult,
		executionProof: ResultView.executionProof({
			...task,
			status,
			terminal: done,
			consumerStarted: Boolean(task.pid || task.processIdentity?.pid)
		}),
		error: succeeded ? null : task.error || Terminal.terminalError(task, status),
		statusPayload: { action: "asyncTaskStatus", taskId },
		waitPayload: { action: "asyncTaskWait", taskId, waitTimeoutMs: Policy.DEFAULT_SAFE_WAIT_MS, pollIntervalMs: 100 },
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
	const done = !Terminal.nonterminal(task.status);
	return {
		ok: true,
		action: "asyncTaskOutputPage",
		taskId,
		stream,
		status: task.status,
		running: task.status === "running",
		runningUnverified: task.status === "running_unverified",
		done,
		retryAfterMs: done ? 0 : 100,
		progressSequence: sequence(task),
		processIdentity: task.processIdentity || null,
		reconciliation: task.reconciliation || null,
		offsetChars,
		returnedChars: content.length,
		totalChars: text.length,
		content,
		hasNextPage,
		nextOffsetChars,
		pollPayload: pagePayload(taskId, stream, nextOffsetChars, maxChars),
		nextPagePayload: hasNextPage ? pagePayload(taskId, stream, nextOffsetChars, maxChars) : undefined
	};
}

function pagePayload(taskId, stream, offsetChars, maxChars) {
	return { action: "asyncTaskOutputPage", taskId, stream, offsetChars, maxChars };
}

function sequence(task = {}) {
	return [String(task.status || "unknown"), String(task.stdout || "").length, String(task.stderr || "").length,
		String(task.finishedAt || task.updatedAt || task.startedAt || "")].join(":");
}

function missing(action, taskId) {
	return { ok: false, action, error: "task_not_found", taskId };
}

module.exports = {
	failureResult: Terminal.failureResult,
	missing,
	outputPage,
	pagePayload,
	receipt,
	sequence,
	terminalError: Terminal.terminalError,
	terminalResult: Terminal.terminalResult
};
