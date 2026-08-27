// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines authoritative fields for focused server-side tunnel responses.
 * @description
 * The Awtsmoos narrows the vessel without narrowing identity, actual task output,
 * continuation, stability, or instruction law. Large operational ledgers require an
 * explicit diagnostic/full response mode instead of leaking into every ordinary reply.
 */
const PREVIEW_KEYS = new Set([
	"createdPreview", "previewId", "viewUrl", "rawUrl", "wsUrl", "url",
	"createUrl", "previewLinks", "previewInstruction", "previewDisplayHint"
]);

const CORE_KEYS = new Set([
	"BH", "ok", "status", "state", "accepted", "durable", "terminal", "retryable",
	"healthImpact", "waitWindowElapsed", "error", "message", "note", "diagnostics",
	"action", "requestAction", "requestedAction", "originalRequestedAction",
	"executionAction", "actualAction", "servedByAction", "adapterAction",
	"canonicalAction", "actionPromoted", "actionMismatch", "type", "id", "tunnelName",
	"requestedTunnelName", "vessel", "routeReference", "routeReason", "queuedMs", "lane",
	"priority", "controlRequestId", "originalControlRequestId", "clientRequestId",
	"conversationId", "conversationName", "agentSessionId", "logicalAgentId", "missionId",
	"projectRoot", "scopeRoot", "workspaceId", "targetVessel", "nonce", "traceId", "spanId",
	"jobId", "workerId", "receiptId", "taskId", "stream", "cwd", "mode", "running", "done",
	"exitCode", "signal", "timedOut", "pending", "timeout", "relayWaitTimedOut", "waitedMs",
	"timeoutMs", "retryAfterMs", "resumeToken", "next", "nextAction", "retryPayload",
	"statusPayload", "waitPayload", "stdoutPagePayload", "stderrPagePayload", "outputPage",
	"cancelPayload", "content", "content64", "stdout", "stderr", "files", "items",
	"detailedItems", "results", "result", "record", "history", "historySummary", "timeline",
	"count", "returnedCount", "totalChars", "returnedChars", "hasNextPage", "nextPagePayload",
	"pollPayload", "nextOffsetChars", "responseMode", "responseShape", "responseProtocol",
	"externalized", "outputRef", "resultRef", "inputRef", "contentUrl", "handoffUrl",
	"ephemeral", "expiresAt", "expiresInSeconds", "bytes", "sha256", "beforeHash", "afterHash",
	"atomic", "verified", "summary", "trust", "inline", "links", "artifacts", "responseFocus",
	"previewPolicy", "previewRequired", "awtsmoosNext", "mustCallNext", "mustContinue",
	"finalAnswerAllowed", "multipleChoiceSelfInterrogation", "aiInstructions", "instructionProtocol",
	"protocolSummary", "instructions", "requiredInstructionIds", "instructionSummaries",
	"missingInstructionIds", "mustFetchBeforeWrite", "stability", "verification", "evidence",
	"progressSequence", "heartbeatAgeMs", "jobStatus", "outputRevision", "snapshotConsistent",
	"writeSnapshotSettled", "writesPending", "writeSnapshotWaitedMs", "settleBudgetMs",
	"receiptOnly", "fullOutputAvailable", "resolvedStateRoot", "crossRootResolved"
]);

for (const key of PREVIEW_KEYS) CORE_KEYS.add(key);

module.exports = { CORE_KEYS, PREVIEW_KEYS };
