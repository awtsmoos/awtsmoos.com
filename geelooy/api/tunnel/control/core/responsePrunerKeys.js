// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Names compact control-response fields that remain authoritative.
 * @description
 * The Awtsmoos narrows the vessel without narrowing the truth. Awtsmoos.com
 * retains correlation, canonical retry identity, durable write hashes, command
 * receipts, and bounded continuation proof while optional preview light stays gated.
 */
const PREVIEW_KEYS = new Set([
	"createdPreview",
	"previewId",
	"viewUrl",
	"rawUrl",
	"wsUrl",
	"url",
	"createUrl",
	"previewLinks",
	"previewInstruction",
	"previewDisplayHint"
]);

const CORE_KEYS = new Set([
	"BH", "ok", "status", "error", "message", "note", "diagnostics",
	"action", "actualAction", "requestAction", "requestedAction",
	"originalRequestedAction", "actionMismatch", "type", "id",
	"tunnelName", "requestedTunnelName", "vessel", "routeReference",
	"routeReason", "queuedMs", "queueStats", "lane", "controlRequestId",
	"originalControlRequestId", "clientRequestId", "conversationId",
	"conversationName", "agentSessionId", "logicalAgentId", "missionId",
	"projectRoot", "targetVessel", "nonce", "jobId", "stream", "running",
	"done", "exitCode", "signal", "timedOut", "pending", "timeout",
	"relayWaitTimedOut", "waitedMs", "timeoutMs", "resumeToken", "next",
	"retryPayload", "statusPayload", "waitPayload", "stdoutPagePayload",
	"stderrPagePayload", "content", "content64", "stdout", "stderr", "files",
	"order", "items", "detailedItems", "results", "result", "record",
	"history", "timeline", "count", "returnedCount", "totalChars",
	"returnedChars", "hasNextPage", "nextPagePayload", "nextOffsetChars",
	"responseMode", "externalized", "outputRef", "resultRef", "inputRef",
	"contentUrl", "handoffUrl", "ephemeral", "expiresAt", "expiresInSeconds",
	"bytes", "sha256", "beforeHash", "afterHash", "beforeSha256",
	"afterSha256", "atomic", "verified", "summary", "inline",
	"originalBytes", "links", "artifacts", "responseFocus", "previewPolicy",
	"previewRequired", "awtsmoosNext", "mustCallNext", "mustContinue",
	"finalAnswerAllowed", "multipleChoiceSelfInterrogation", "allCapsPrompt",
	"acceptedAnswerFormat", "aiInstructions", "path", "absolutePath", "root",
	"durableRequestReceipt", "verification", "executionCompleted", "replayed",
	"replaySource", "resultSha256", "recoveredAfterRestart", "retryable",
	"partial", "errorCount", "okCount"
]);

for (const key of PREVIEW_KEYS) {
	CORE_KEYS.add(key);
}

module.exports = {
	CORE_KEYS,
	PREVIEW_KEYS
};
