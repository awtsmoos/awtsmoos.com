// B"H
// Boruch Hashem
// Blessed is He

/** Explicit non-AI URL carriers. AI and website-mission payloads are packed by tunnelAiPayload. */
export const NUMBER_KEYS = [
	"depth", "limit", "maxChars", "totalMaxChars", "maxFiles",
	"offsetChars", "maxBytes", "offsetBytes", "timeoutMs", "port",
	"maxDepth", "maxChildrenPerTask", "maxTotalTasks",
	"minimumInnovationWindowMs", "minimumProductiveCycles",
	"minimumProductiveMs", "agentCount", "count", "startSpacingMs",
	"collaborationRounds", "maxContinuationTurns", "authPollMs",
	"maxSubagentDepth", "maxSubagentsPerAgent", "maxTotalWebsiteAgents",
	"subagentStartSpacingMs"
];

export const BOOLEAN_KEYS = [
	"regex", "replaceAll", "allowWrite", "allowSecrets",
	"enableLocalHttpProxy", "allowCommands", "stream",
	"refreshAuthentication", "reuseExisting", "automatic",
	"allowRecursiveSubagents"
];

export const TEXT64_KEYS = [
	"content", "find", "replace", "command", "expression", "sdp",
	"candidate", "frame", "frame64"
];

export const JSON64_KEYS = [
	"paths", "files", "writes", "tools", "chrome", "commandConfig",
	"aiAgents", "messages", "input", "scopes", "directories"
];

export const SCALAR_KEYS = [
	"root", "local", "relay", "setTunnelName", "shell", "cwd", "url",
	"selector", "chromePath", "userDataDir", "id", "sessionId", "mode",
	"agentMode", "defaultMode", "grantMode", "family", "inputFamily",
	"source", "snapshot", "target", "requester", "requesterContact",
	"contact", "purpose", "scope", "ttl", "ttlSeconds", "type",
	"inputType", "x", "y", "key", "reason", "label", "title",
	"contentType", "bytes", "format", "quality", "fingerprint", "query",
	"conversationId", "conversationName", "jobId", "taskId",
	"websiteMissionId", "stream", "missionId", "agentId", "toAgent",
	"role", "capabilities", "projectRoot", "status", "currentAction",
	"note", "goal", "targetVessel", "agentStartUrl", "customGptUrl",
	"customGptName", "gptName"
];
