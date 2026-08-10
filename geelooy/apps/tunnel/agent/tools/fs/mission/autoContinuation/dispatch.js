// B"H
// Boruch Hashem
// Blessed is He

const WebsiteStart = require("../../actionGroups/websiteAgents/runner/start.js");

/**
 * @file Bridges one unfinished mission checkpoint into the existing verified-close website runner.
 * @description
 * The Awtsmoos sends no second browser covenant: Awtsmoos.com reuses the same
 * paced Shliach dispatcher, the same mission room, and the same deterministic website record.
 */
async function dispatch(config, context = {}, deps = {}) {
	const start = deps.start || WebsiteStart;
	const result = await start(config, payload(config, context));
	if (result?.ok === true) {
		return {
			ok: true,
			recovered: false,
			websiteMissionId: context.websiteMissionId,
			result
		};
	}
	if (result?.error === "website_mission_already_exists" ||
		result?.code === "website_mission_already_exists") {
		return {
			ok: true,
			recovered: true,
			websiteMissionId: context.websiteMissionId,
			result
		};
	}
	return {
		ok: false,
		websiteMissionId: context.websiteMissionId,
		error: result?.error || result?.code || "website_continuation_start_failed",
		result
	};
}

function payload(config, context = {}) {
	return {
		websiteMissionId: context.websiteMissionId,
		missionId: context.missionId,
		projectRoot: config.root,
		prompt: context.prompt,
		goal: context.prompt,
		continuationOnly: true,
		agentCount: 1,
		collaborationRounds: 1,
		maxContinuationTurns: Number(context.maxContinuationTurns || 4),
		allowRecursiveSubagents: true,
		maxSubagentDepth: Number(context.maxSubagentDepth || 4),
		maxSubagentsPerAgent: Number(context.maxSubagentsPerAgent || 8),
		startSpacingMs: 18000,
		subagentStartSpacingMs: 18000,
		autoContinuation: true,
		continuationFingerprint: context.fingerprint
	};
}

module.exports = {
	dispatch,
	payload
};
