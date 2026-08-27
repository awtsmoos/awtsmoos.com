// B"H
// Boruch Hashem
// Blessed is He

const COMMON = [
	"BH", "ok", "action", "status", "error", "summary", "next",
	"responseShape", "previewRequired", "responseFocus", "previewPolicy"
];
const TRANSPORT = [
	"type", "id", "tunnelName", "requestedTunnelName", "controlRequestId",
	"clientRequestId", "agentSessionId", "logicalAgentId", "projectRoot", "nonce",
	"requestAction", "actualAction", "actionMismatch", "vessel", "routeReason"
];
const POLLING = [
	"retryAfterMs", "pollImmediately", "progressSequence", "heartbeatAgeMs",
	"statusPayload", "waitPayload", "pollPayload"
];
const OUTPUT_SNAPSHOT = [
	"jobStatus", "outputRevision", "snapshotConsistent",
	"writeSnapshotSettled", "writesPending", "writeSnapshotWaitedMs",
	"settleBudgetMs"
];
const TASK_CORE = [
	"taskId", "running", "done", "pid", "processIdentity", "startedAt",
	"finishedAt", "exitCode", "signal", "stdoutPagePayload",
	"stderrPagePayload", "cancelPayload", ...POLLING
];
const OUTPUT_PAGE = [
	"stream", "content", "offsetChars", "returnedChars", "totalChars",
	"hasNextPage", "nextOffsetChars", "nextPagePayload"
];
const COMMAND_CANCEL = [
	"jobId", "workerId", "receiptId", "running", "done", "finishedAt",
	"cancelled", "alreadyTerminal", "detachedRecovered", "reaperClaimed",
	"reaperTimedOut", "cleanup", "processIdentity", "processComparison",
	...POLLING
];

/**
 * @file Whitelists compact response truth for every public runtime action.
 * @description
 * The Awtsmoos lets compression remove repetition but never causality. Awtsmoos.com
 * keeps cancellation's process witness and terminal cause visible through the same
 * bounded contract discipline used by command, task, mission, and filesystem replies.
 */
const CONTRACTS = Object.freeze({
	read: ["content", "returnedChars", "totalChars", "hasNextPage", "nextOffsetChars", "nextPagePayload", "absolutePath", "path"],
	readLines: ["content", "lines", "returnedLines", "totalLines", "hasNextPage", "nextPagePayload", "absolutePath", "path"],
	readManyLines: ["results", "files", "count", "errors"],
	list: ["items", "entries", "files", "dirs", "count", "root", "absolutePath"],
	tree: ["items", "entries", "files", "dirs", "count", "root", "absolutePath"],
	stat: ["exists", "isFile", "isDirectory", "size", "mtimeMs", "absolutePath", "path"],
	write: ["absolutePath", "path", "bytes", "written", "hash", "sha256"],
	bulkWrite: ["taskId", "status", "running", "done", "results", "count", "statusPayload", "waitPayload"],
	commandStart: ["jobId", "running", "done", "stdoutPagePayload", "stderrPagePayload", "outputPage", ...POLLING],
	commandRun: ["jobId", "running", "done", "stdoutPagePayload", "stderrPagePayload", "outputPage", "stdout", "stderr", "exitCode", ...POLLING],
	commandStatus: ["jobId", "workerId", "receiptId", "queued", "running", "done", "stdoutPagePayload", "stderrPagePayload", ...POLLING],
	commandPoll: ["jobId", "workerId", "receiptId", "queued", "running", "done", "stdoutPagePayload", "stderrPagePayload", ...POLLING],
	commandJobStatus: ["jobId", "workerId", "receiptId", "queued", "running", "done", "stdoutPagePayload", "stderrPagePayload", ...POLLING],
	commandWait: ["jobId", "running", "done", "exitCode", "signal", "timedOut", "stdoutPagePayload", "stderrPagePayload", "outputPage", ...POLLING],
	commandCancel: COMMAND_CANCEL,
	commandJobCancel: COMMAND_CANCEL,
	commandJobOutputPage: ["jobId", ...OUTPUT_PAGE, ...POLLING, ...OUTPUT_SNAPSHOT],
	commandOutputPage: ["jobId", ...OUTPUT_PAGE, ...POLLING, ...OUTPUT_SNAPSHOT],
	asyncTaskStart: TASK_CORE,
	asyncTaskStatus: TASK_CORE,
	asyncTaskWait: [...TASK_CORE, "waitedMs", "stdout", "stderr"],
	asyncTaskCancel: TASK_CORE,
	asyncTaskOutputPage: ["taskId", ...OUTPUT_PAGE, "running", "done", "processIdentity", ...POLLING],
	taskReceipt: ["taskId", "state", "status", "running", "done", "progress", "result", "error", "resume", "outputPage", "evidence"],
	taskStatus: ["taskId", "state", "status", "running", "done", "progress", "result", "error", "resume", "outputPage", "evidence"],
	taskOutputPage: ["taskId", ...OUTPUT_PAGE],
	missionStart: ["missionId", "status", "running", "done", "resume", "nextAction", "plan", "queue", "evidence"],
	missionStatus: ["missionId", "status", "running", "done", "resume", "nextAction", "plan", "queue", "evidence"],
	previewExposeLocalServer: ["preview", "url", "proxyUrl", "detectedServers", "selectedServer", "agentGuidance", "nextSuggestedAction"],
	previewCreate: ["preview", "url", "viewUrl", "rawUrl", "wsUrl"],
	previewFile: ["preview", "url", "viewUrl", "rawUrl", "wsUrl"],
	previewFolder: ["preview", "url", "viewUrl", "rawUrl", "wsUrl"],
	previewPage: ["preview", "url", "viewUrl", "rawUrl", "wsUrl"]
});

function keysFor(action = "") {
	return [...new Set([...TRANSPORT, ...COMMON, ...(CONTRACTS[action] || [])])];
}

function pick(action, result = {}) {
	const output = {};
	for (const key of keysFor(action || result.action || result.actualAction || result.requestAction)) {
		if (result[key] !== undefined) output[key] = result[key];
	}
	return output;
}

function has(action, key) {
	return keysFor(action).includes(key);
}

module.exports = {
	COMMAND_CANCEL, COMMON, CONTRACTS, OUTPUT_PAGE, OUTPUT_SNAPSHOT,
	POLLING, TASK_CORE, TRANSPORT, has, keysFor, pick
};
