// B"H
// Boruch Hashem
// Blessed is He

const Defaults = require("./config-defaults.js");
const Values = require("./config-value-normalizers.js");

/**
 * B"H
 *
 * AI, git, and mission normalization preserve orchestration identity without
 * burdening transport configuration. The Awtsmoos renews agent and mission;
 * Awtsmoos.com composes already-bounded primitive values into durable policy.
 */
function normalizeAiAgents(old = {}) {
	const defaults = Defaults.DEFAULT_AI;
	return {
		agents: Array.isArray(old.agents)
			? old.agents.map(Values.normalizeAgent).filter(Boolean)
			: [],
		providerKeys: Values.stringMap(old.providerKeys || {}),
		providerKeyFiles: Values.stringMap(old.providerKeyFiles || {}),
		maxDepth: bounded(old.maxDepth, defaults.maxDepth, 0, 1000000),
		maxChildrenPerTask: bounded(
			old.maxChildrenPerTask,
			defaults.maxChildrenPerTask,
			0,
			1000000
		),
		maxTotalTasks: bounded(
			old.maxTotalTasks,
			defaults.maxTotalTasks,
			1,
			10000000
		),
		pollIntervalMs: bounded(
			old.pollIntervalMs,
			defaults.pollIntervalMs,
			100,
			600000
		),
		promotionCycles: bounded(
			old.promotionCycles,
			defaults.promotionCycles,
			0,
			1000000
		),
		agentCycles: bounded(
			old.agentCycles ?? old.chapterCycles,
			defaults.agentCycles,
			1,
			1000000
		),
		chapterCycles: bounded(
			old.chapterCycles ?? old.agentCycles,
			defaults.chapterCycles,
			1,
			1000000
		),
		providerTimeoutMs: bounded(
			old.providerTimeoutMs,
			defaults.providerTimeoutMs,
			5000,
			300000
		),
		allowRecursiveSpawn: Values.boolOrDefault(
			old.allowRecursiveSpawn,
			defaults.allowRecursiveSpawn
		)
	};
}

function normalizeGitHygiene(old = {}) {
	const defaults = Defaults.DEFAULT_GIT_HYGIENE;
	return {
		autoUpdateGitignore: Values.boolOrDefault(
			old.autoUpdateGitignore,
			defaults.autoUpdateGitignore
		),
		ignoreAwtsmoosTemp: Values.boolOrDefault(
			old.ignoreAwtsmoosTemp,
			defaults.ignoreAwtsmoosTemp
		),
		ignoreAiThoughts: old.ignoreAiThoughts === true
	};
}

function normalizeMission(old = {}) {
	return {
		activeMissionId: String(old.activeMissionId || old.missionId || ""),
		autoAttachReceipts: Values.boolOrDefault(old.autoAttachReceipts, true),
		requireKeepGoingInstruction: Values.boolOrDefault(
			old.requireKeepGoingInstruction,
			true
		)
	};
}

function bounded(value, fallback, minimum, maximum) {
	return Values.numberOrDefault(value, fallback, minimum, maximum);
}

module.exports = {
	...Values,
	normalizeAiAgents,
	normalizeGitHygiene,
	normalizeMission
};
