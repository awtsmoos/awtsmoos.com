// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Declares bounded tunnel URL carriers by encoding type.
 * @description
 * The Awtsmoos renews every field without letting arbitrary browser properties
 * cross the boundary. Awtsmoos.com keeps each allowlist explicit so future routes
 * can evolve without silently widening the request surface.
 */
export const NUMBER_KEYS = [
	"depth", "limit", "maxChars", "totalMaxChars", "maxFiles",
	"offsetChars", "maxBytes", "offsetBytes", "timeoutMs", "port",
	"maxDepth", "maxChildrenPerTask", "maxTotalTasks",
	"minimumInnovationWindowMs", "minimumProductiveCycles",
	"minimumProductiveMs"
];

export const BOOLEAN_KEYS = [
	"regex", "replaceAll", "allowWrite", "allowSecrets",
	"enableLocalHttpProxy", "allowCommands", "stream"
];

export const TEXT64_KEYS = [
	"content", "find", "replace", "command", "expression", "sdp",
	"candidate", "frame", "frame64"
];

export const JSON64_KEYS = [
	"paths", "files", "writes", "tools", "chrome", "commandConfig",
	"aiAgents", "messages", "input"
];

export const SCALAR_KEYS = [
	"root", "local", "relay", "setTunnelName", "shell", "cwd", "url",
	"selector", "chromePath", "userDataDir", "id", "sessionId", "mode",
	"grantMode", "family", "inputFamily", "source", "snapshot", "target",
	"requester", "requesterContact", "contact", "purpose", "scope", "ttl",
	"ttlSeconds", "type", "inputType", "x", "y", "key", "reason", "label",
	"title", "contentType", "bytes", "format", "quality", "fingerprint",
	"query", "conversationId", "conversationName", "jobId", "stream",
	"missionId", "agentId", "role", "capabilities", "projectRoot", "status",
	"currentAction", "note", "goal"
];
