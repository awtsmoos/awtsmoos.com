// B"H
// Boruch Hashem
// Blessed is He

import { b64Text } from "../lib/base64.js";

/**
 * Carries provider delegates and website missions through one bounded JSON
 * vessel. Without these exact fields a pretty roster can never address its
 * backend record, so the allowlist is tested as part of the live URL contract.
 */
const AI_ACTIONS = new Set([
	"agent",
	"aiAgentList",
	"aiAgentSetProviderKey",
	"aiAgentRemoveProviderKey",
	"aiAgentMessage",
	"aiAgentSpawnTask",
	"aiAgentSpawnNovel",
	"aiAgentTaskStatus",
	"aiAgentTaskResult",
	"aiAgentTaskList",
	"aiAgentConfigSet",
	"aiAgentSpawnWebsiteMission",
	"aiAgentWebsiteMissionStatus",
	"websiteAgentMissionStart",
	"websiteAgentMissionList",
	"websiteAgentMissionStatus",
	"websiteAgentMissionMessage",
	"websiteAgentMissionStop",
	"websiteAgentMissionForget",
	"chatgptWebsiteLogout"
]);

const PUBLIC_KEYS = [
	"mode", "agentMode", "defaultMode", "provider", "providerId", "agent",
	"agentId", "model", "taskId", "websiteMissionId", "missionId", "kind",
	"title", "projectRoot", "outputDir", "fileName", "message", "body",
	"text", "prompt", "goal", "system", "stream", "agentCount", "count",
	"scopes", "paths", "directories", "startSpacingMs",
	"collaborationRounds", "maxContinuationTurns", "authPollMs",
	"agentStartUrl", "customGptUrl", "customGptName", "gptName",
	"allowRecursiveSubagents", "maxSubagentDepth", "maxSubagentsPerAgent",
	"maxTotalWebsiteAgents", "subagentStartSpacingMs",
	"refreshAuthentication", "toAgent", "reuseExisting", "automatic",
	"maxDepth", "maxChildrenPerTask", "maxTotalTasks",
	"minimumInnovationWindowMs", "minimumProductiveCycles",
	"minimumProductiveMs", "allowRecursiveSpawn", "pollIntervalMs",
	"promotionCycles", "agentCycles", "chapterCycles", "providerTimeoutMs",
	"limit", "apiKey", "saveToAccount", "saveProviderKeyToAccount",
	"remoteSaveAccount", "storeProviderKeyRemotely", "targetVessel"
];

export function isAiAction(action) {
	return AI_ACTIONS.has(String(action || ""));
}

export function publicAiPayload(options = {}) {
	return Object.fromEntries(PUBLIC_KEYS
		.filter(key => hasValue(options[key]))
		.map(key => [key, options[key]]));
}

export function attachAiPayload(url, options = {}) {
	if (!isAiAction(options.action)) return;
	const payload = publicAiPayload(options);
	if (!Object.keys(payload).length) return;
	url.searchParams.set("text64", b64Text(JSON.stringify(payload)));
}

function hasValue(value) {
	return value !== undefined && value !== null && value !== "";
}

export { AI_ACTIONS, PUBLIC_KEYS };
