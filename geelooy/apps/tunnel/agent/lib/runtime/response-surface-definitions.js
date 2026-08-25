// B"H
// Boruch Hashem
// Blessed is He

const DEBUG_MODES = new Set(["debug", "full", "audit", "raw"]);
const DIAGNOSTIC_MODES = new Set(["diagnostic", "standard"]);

/**
 * @file Defines focused default responses and explicitly expanded diagnostic responses.
 * @description
 * The Awtsmoos does not confuse testimony with every internal detail. Awtsmoos.com
 * keeps identity, result, timing, continuation, and instruction protocol in the ordinary
 * vessel while queue trees, process internals, and worker ledgers require explicit intent.
 */
const CORRELATION_KEYS = Object.freeze([
	"type", "id", "originRegistrationKey", "tunnelName", "requestedTunnelName",
	"controlRequestId", "clientRequestId", "agentSessionId", "logicalAgentId",
	"conversationId", "missionId", "projectRoot", "nonce", "requestAction",
	"requestedAction", "executionAction", "actualAction", "servedByAction",
	"canonicalAction", "actionPromoted", "actionMismatch", "jobId", "workerId",
	"receiptId", "traceId", "spanId", "transportReceiptId", "vessel",
	"routeReference", "routeReason"
]);

const ESSENTIAL_KEYS = Object.freeze([
	"payload", "schema", "protocol", "protocolSummary", "instructionProtocol",
	"instructions", "requiredInstructionIds", "instructionSummaries",
	"missingInstructionIds", "mustFetchBeforeWrite", "result", "record", "items",
	"detailedItems", "files", "history", "timeline", "count", "returnedCount",
	"content", "content64", "stdout", "stderr", "stream", "offsetChars",
	"returnedChars", "totalChars", "hasNextPage", "nextOffsetChars", "pollPayload",
	"statusPayload", "waitPayload", "stdoutPagePayload", "stderrPagePayload",
	"outputPage", "retryPayload", "cancelPayload", "retryAfterMs", "lane", "mode",
	"timeoutMs", "exitCode", "signal", "fullOutputAvailable", "receiptOnly",
	"resolvedStateRoot", "crossRootResolved", "snapshotConsistent",
	"writeSnapshotSettled", "writesPending", "writeSnapshotWaitedMs", "settleBudgetMs",
	"progressSequence", "heartbeatAgeMs", "jobStatus", "outputRevision", "links",
	"artifacts", "verification", "resultSha256", "beforeHash", "afterHash", "sha256",
	"queuedMs", "waitedMs", "startedAt", "updatedAt", "finishedAt",
	"longLivedConnection", "advisoryOvertime", "pollImmediately", "syncOptIn", "shell"
]);

const DIAGNOSTIC_KEYS = Object.freeze([
	"queue", "queueStats", "receipt", "worker", "workers", "storage",
	"processIdentity", "processGroupId", "birthToken", "pid", "cost", "cleanup",
	"health", "stats", "connection", "resourceUsage", "processComparison",
	"durableRequestReceipt", "historySummary", "historicalNativeDevices"
]);

module.exports = {
	CORRELATION_KEYS,
	DEBUG_MODES,
	DIAGNOSTIC_KEYS,
	DIAGNOSTIC_MODES,
	ESSENTIAL_KEYS
};
