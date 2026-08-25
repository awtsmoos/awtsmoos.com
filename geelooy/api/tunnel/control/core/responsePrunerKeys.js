// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Names the compact testimony permitted in a normal tunnel connection receipt.
 * @description
 * The Awtsmoos is infinite while a useful receipt may remain small; Awtsmoos.com keeps
 * identity, requested output, continuation, and durable mutation evidence without forcing
 * each response to recite every worker, lane, mailbox record, process path, and diagnostic wall.
 *
 * Gevurah removes diagnostic oceans, while Hod preserves the hashes and receipts that let a
 * future retry testify what truly happened. Both historical hash aliases and explicit SHA-256
 * names remain visible so compactness can never erase the proof required for reconciliation.
 */
const PREVIEW_KEYS = new Set([
	"createdPreview",
	"previewId",
	"viewUrl",
	"rawUrl",
	"wsUrl",
	"url",
	"previewLinks",
	"previewInstruction",
	"previewDisplayHint"
]);

const RECEIPT_KEYS = new Set([
	"BH", "ok", "status", "state", "error", "message", "note", "diagnostics",
	"action", "requestAction", "requestedAction", "originalRequestedAction",
	"executionAction", "actualAction", "servedByAction", "canonicalAction",
	"actionPromoted", "actionMismatch", "type", "id", "tunnelName",
	"requestedTunnelName", "vessel", "routeReference", "routeReason",
	"controlRequestId", "originalControlRequestId", "clientRequestId",
	"originalClientRequestId", "agentSessionId", "logicalAgentId", "missionId",
	"projectRoot", "scopeRoot", "nonce", "jobId", "workerId", "receiptId",
	"taskId", "stream", "lane", "priority", "cwd", "mode", "running", "done",
	"exitCode", "signal", "timedOut", "pending", "retryable", "retryAfterMs",
	"pollImmediately", "queuedMs", "waitedMs", "resumeToken", "next", "nextAction",
	"retryPayload", "statusPayload", "waitPayload", "stdoutPagePayload",
	"stderrPagePayload", "outputPage", "cancelPayload", "content", "content64",
	"files", "items", "results", "result", "record", "count", "returnedCount",
	"totalChars", "returnedChars", "hasNextPage", "nextPagePayload", "pollPayload",
	"nextOffsetChars", "responseMode", "responseShape", "responseProtocol",
	"externalized", "outputRef", "resultRef", "detailsRef", "contentUrl",
	"handoffUrl", "expiresAt", "expiresInSeconds", "bytes", "sha256",
	"beforeHash", "afterHash", "beforeSha256", "afterSha256", "atomic", "verified",
	"summary", "trust", "inline", "links", "artifacts", "responseFocus",
	"previewPolicy", "previewRequired", "mustCallNext", "mustContinue",
	"finalAnswerAllowed", "multipleChoiceSelfInterrogation", "acceptedAnswerFormat",
	"path", "absolutePath", "root", "durableRequestReceipt", "verification",
	"executionCompleted", "replayed", "replaySource", "resultSha256",
	"recoveredAfterRestart", "partial", "errorCount", "okCount", "receipt",
	"progressSequence", "heartbeatAgeMs", "jobStatus", "outputRevision",
	"snapshotConsistent", "writeSnapshotSettled", "writesPending",
	"writeSnapshotWaitedMs", "settleBudgetMs"
]);

for (const key of PREVIEW_KEYS) {
	RECEIPT_KEYS.add(key);
}

module.exports = {
	PREVIEW_KEYS,
	RECEIPT_KEYS
};
