// B"H
// Boruch Hashem
// Blessed is He

const DEBUG_MODES = new Set(["debug", "full", "audit", "raw", "standard"]);
const CORRELATION_KEYS = [
	"type", "id", "tunnelName", "requestedTunnelName", "controlRequestId",
	"clientRequestId", "agentSessionId", "logicalAgentId", "agentName",
	"projectRoot", "workspaceId", "nonce", "conversationId", "conversationName",
	"missionId", "roomId", "leaseId", "parentActionId", "traceId", "spanId",
	"causalParentId", "correlationId", "actionId", "vessel", "routeReason",
	"requestAction", "actualAction", "actionMismatch", "requestedAction",
	"requestedActionRaw", "jobId", "workerId", "receiptId", "taskId",
	"stream", "cwd", "command", "path", "paths"
];
const ESSENTIAL_KEYS = [
	"content", "content64", "offsetChars", "returnedChars", "totalChars",
	"hasNextPage", "nextOffsetChars", "nextPagePayload", "pollPayload",
	"items", "entries", "detailedItems", "files", "dirs", "order",
	"count", "returnedCount", "root", "absolutePath", "relativePath",
	"exists", "isDirectory", "isFile", "size", "mtimeMs", "birthtimeMs",
	"sha256", "hash", "bytes", "written", "running", "done", "queued",
	"statusPayload", "waitPayload", "stdoutPagePayload", "stderrPagePayload",
	"outputPagePayload", "outputPage", "cancelPayload", "results", "result",
	"errors", "diagnostics", "message", "record", "history", "session",
	"queue", "queueStats", "queuedMs", "waitedMs", "longLivedConnection",
	"advisoryOvertime", "retryAfterMs", "retryable", "pollImmediately",
	"progressSequence", "heartbeatAgeMs", "jobStatus", "outputRevision",
	"snapshotConsistent", "writeSnapshotSettled", "writesPending",
	"writeSnapshotWaitedMs", "settleBudgetMs", "receipts", "receipt",
	"worker", "workers", "mission", "cost", "recovery", "cleanup",
	"processIdentity", "processComparison", "osLinks", "birthToken",
	"startedAt", "updatedAt", "finishedAt", "phase", "promptCount",
	"preview", "url", "viewUrl", "proxyUrl", "rawUrl", "wsUrl",
	"detectedServers", "selectedServer", "agentGuidance", "nextSuggestedAction",
	"state", "progress", "resume", "plan", "evidence", "chrome",
	"targets", "pages", "activeTarget", "currentUrl", "currentTarget",
	"browser", "port", "enabled", "pid", "processGroupId", "version",
	"webSocketDebuggerUrl", "responseShape", "responseMode",
	"responseProtocol", "storage", "trust", "warnings", "mode",
	"syncOptIn", "aiInstructions", "shell", "timeoutMs", "stdout",
	"stderr", "stdoutBytes", "stderrBytes", "exitCode", "signal",
	"durationMs", "resourceUsage", "orphanReason", "reconciliationAt",
	"health", "stats", "lane", "priority"
];

module.exports = { CORRELATION_KEYS, DEBUG_MODES, ESSENTIAL_KEYS };
