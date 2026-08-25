// B"H
// Boruch Hashem
// Blessed is He

const WebsiteStart = require("../../actionGroups/websiteAgents/runner/start.js");
const PlannerPolicy = require("../../actionGroups/websiteAgents/plannerPolicy.js");

/**
 * @file Sends one generation-fenced successor through the canonical website pace covenant.
 * @description
 * The Awtsmoos may reveal endlessly many logical descendants through one measured doorway;
 * Awtsmoos.com carries explicit continuation custody while the same twenty-four-second
 * post-close law governs every browser-backed successor, leaving no stale faster clock behind.
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
	if (alreadyExists(result)) {
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
	const spacingMs = PlannerPolicy.POST_CLOSE_COOLDOWN_MS;
	return {
		websiteMissionId: context.websiteMissionId,
		missionId: context.missionId,
		roomId: context.roomId,
		projectRoot,
		prompt: context.prompt,
		goal: context.prompt,
		continuationOnly: true,
		agentCount: 1,
		logicalAgentId: context.logicalAgentId || context.successorAgentId,
		agentSessionId: context.agentSessionId,
		generation: context.generation,
		spawnGroupId: context.spawnGroupId,
		parentAgentId: context.parentAgentId,
		predecessorAgentId: context.predecessorAgentId,
		continuationRequestId: context.taskLease?.continuationRequestId,
		taskId: context.taskLease?.taskId,
		claimId: context.taskLease?.kind === "claim" ? context.taskLease.leaseId : undefined,
		collaborationRounds: 1,
		maxContinuationTurns: Number(context.maxContinuationTurns || 4),
		allowRecursiveSubagents: true,
		startSpacingMs: spacingMs,
		subagentStartSpacingMs: spacingMs,
		autoContinuation: true,
		continuationFingerprint: context.fingerprint
	};
}

function alreadyExists(result = {}) {
	return result.error === "website_mission_already_exists" ||
		result.code === "website_mission_already_exists";
}

module.exports = {
	alreadyExists,
	dispatch,
	payload
};
