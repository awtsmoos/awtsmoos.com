// B"H
// Boruch Hashem
// Blessed is He

import { b64Text } from "../lib/base64.js";

/**
 * @file Encodes the public AI-agent payload carried through tunnel URLs.
 * @description
 * The Awtsmoos renews message and provider without leaking unrelated browser state.
 * Awtsmoos.com selects an explicit allowlist, then carries the testimony as one
 * bounded base64 field through the same guarded request gate.
 */
const AI_ACTIONS = new Set([
	"aiAgentList",
	"aiAgentSetProviderKey",
	"aiAgentRemoveProviderKey",
	"aiAgentMessage",
	"aiAgentSpawnTask",
	"aiAgentSpawnNovel",
	"aiAgentTaskStatus",
	"aiAgentTaskResult",
	"aiAgentTaskList",
	"aiAgentConfigSet"
]);

const PUBLIC_KEYS = [
	"provider",
	"providerId",
	"agent",
	"agentId",
	"model",
	"taskId",
	"kind",
	"title",
	"outputDir",
	"fileName",
	"message",
	"prompt",
	"system",
	"stream",
	"maxDepth",
	"maxChildrenPerTask",
	"maxTotalTasks",
	"minimumInnovationWindowMs",
	"minimumProductiveCycles",
	"minimumProductiveMs",
	"allowRecursiveSpawn",
	"pollIntervalMs",
	"promotionCycles",
	"agentCycles",
	"chapterCycles",
	"providerTimeoutMs",
	"limit",
	"apiKey",
	"saveToAccount",
	"saveProviderKeyToAccount",
	"remoteSaveAccount",
	"storeProviderKeyRemotely",
	"targetVessel"
];

export function isAiAction(action) {
	return AI_ACTIONS.has(String(action || ""));
}

export function publicAiPayload(options = {}) {
	return Object.fromEntries(
		PUBLIC_KEYS
			.filter((key) => hasValue(options[key]))
			.map((key) => [key, options[key]])
	);
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
