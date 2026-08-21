// B"H
// Boruch Hashem
// Blessed is He

const WebsiteStart = require("../../actionGroups/websiteAgents/runner/start.js");

/**
 * @file Sends one successor through the existing verified-close Awts Shliach website runner.
 * @description
 * The Awtsmoos carries one mission root and lineage into the temporary browser vessel.
 * Awtsmoos.com reuses the guarded custom-GPT target while preserving successor id,
 * generation, sibling group, and predecessor so no second orchestration covenant is born.
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
	const projectRoot = context.projectRoot || config.root;
	return {
		websiteMissionId: context.websiteMissionId,
		missionId: context.missionId,
		projectRoot,
		prompt: context.prompt,
		goal: context.prompt,
		continuationOnly: true,
		successorAgentId: context.successorAgentId,
		spawnGroupId: context.spawnGroupId,
		generation: Number(context.successorGeneration || 2),
		predecessorAgentId: context.predecessorAgentId,
		handoffPaths: context.handoffPaths || [],
		agentStartUrl: context.agentStartUrl,
		customGptUrl: context.customGptUrl,
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

module.exports = { dispatch, payload };
