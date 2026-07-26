// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Names compact response fields that remain authoritative.
	* @description
	* The Awtsmoos narrows the vessel without narrowing identity. Awtsmoos.com
	* keeps request, execution, scope, worker, receipt, continuation, and output proof.
	*/
const PREVIEW_KEYS = new Set([
	"createdPreview", "previewId", "viewUrl", "rawUrl", "wsUrl", "url",
	"createUrl", "previewLinks", "previewInstruction", "previewDisplayHint"
]);

const CORE_KEYS = new Set([
	"BH", "ok", "status", "error", "message", "note", "diagnostics",
	"action", "requestAction", "requestedAction", "originalRequestedAction",
	"executionAction", "actualAction", "servedByAction", "adapterAction",
	"canonicalAction", "actionPromoted", "actionMismatch", "type", "id",
	"tunnelName", "requestedTunnelName", "vessel", "routeReference",
	"routeReason", "queuedMs", "queue", "queueStats", "lane", "priority",
	"controlRequestId", "originalControlRequestId", "clientRequestId",
	"conversationId", "conversationName", "agentSessionId", "logicalAgentId",
	"missionId", "projectRoot", "scopeRoot", "workspaceId", "targetVessel",
	"nonce", "traceId", "spanId", "causalParentId", "parentActionId",
	"jobId", "workerId", "receiptId", "taskId", "stream", "cwd", "command",
	"shell", "mode", "running", "done", "exitCode", "signal", "timedOut",
	"pending", "timeout", "relayWaitTimedOut", "waitedMs", "timeoutMs",
	"resumeToken", "next", "nextAction", "retryPayload", "statusPayload",
	"waitPayload", "stdoutPagePayload", "stderrPagePayload", "outputPage",
	"cancelPayload", "content", "content64", "stdout", "stderr", "files",
	"order", "items", "detailedItems", "results", "result", "record",
	"history", "timeline", "count", "returnedCount", "totalChars",
	"returnedChars", "hasNextPage", "nextPagePayload", "pollPayload",
	"nextOffsetChars", "responseMode", "responseShape", "responseProtocol",
	"externalized", "outputRef", "resultRef", "inputRef", "contentUrl",
	"handoffUrl", "ephemeral", "expiresAt", "expiresInSeconds", "bytes",
	"sha256", "beforeHash", "afterHash", "beforeSha256", "afterSha256",
	"atomic", "verified", "summary", "trust", "inline", "originalBytes",
	"links", "artifacts", "responseFocus", "previewPolicy", "previewRequired",
	"awtsmoosNext", "mustCallNext", "mustContinue", "finalAnswerAllowed",
	"multipleChoiceSelfInterrogation", "allCapsPrompt", "acceptedAnswerFormat",
	"aiInstructions", "path", "absolutePath", "root", "durableRequestReceipt",
	"verification", "executionCompleted", "replayed", "replaySource",
	"resultSha256", "recoveredAfterRestart", "retryable", "partial",
	"errorCount", "okCount", "receipt", "worker", "workers", "storage",
	"processIdentity", "processGroupId", "birthToken", "pid", "evidence",
	"cost", "cleanup", "progressSequence", "heartbeatAgeMs", "jobStatus",
	"outputRevision", "snapshotConsistent", "writeSnapshotSettled",
	"writesPending", "writeSnapshotWaitedMs", "settleBudgetMs"
]);

for (const key of PREVIEW_KEYS) CORE_KEYS.add(key);

module.exports = { CORE_KEYS, PREVIEW_KEYS };
