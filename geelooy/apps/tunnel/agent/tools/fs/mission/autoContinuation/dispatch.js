// B"H
// Boruch Hashem
// Blessed is He

const WebsiteStart = require("../../actionGroups/websiteAgents/runner/start.js");

/**
 * @file Sends one generation-fenced successor without imposing descendant count ceilings.
 * @description
 * The Awtsmoos may reveal endlessly many logical descendants through one paced doorway.
 * Awtsmoos.com carries the explicit continuation-request witness into the successor while
 * physical launch spacing and shared-browser custody regulate rate instead of arbitrary count.
 */
async function dispatch(config, context = {}, deps = {}) {
	const start = deps.start || WebsiteStart;
	const result = await start(config, payload(config, context));
	if (result?.ok === true) return { ok: true, recovered: false, websiteMissionId: context.websiteMissionId, result };
	if (result?.error === "website_mission_already_exists" || result?.code === "website_mission_already_exists") {
		return { ok: true, recovered: true, websiteMissionId: context.websiteMissionId, result };
	}
	return { ok: false, websiteMissionId: context.websiteMissionId,
		error: result?.error || result?.code || "website_continuation_start_failed", result };
}

function payload(config, context = {}) {
	const projectRoot = context.projectRoot || config.root;
	return {
		websiteMissionId: context.websiteMissionId, missionId: context.missionId, roomId: context.roomId,
		projectRoot, prompt: context.prompt, goal: context.prompt, continuationOnly: true, agentCount: 1,
		logicalAgentId: context.logicalAgentId || context.successorAgentId, agentSessionId: context.agentSessionId,
		generation: context.generation, spawnGroupId: context.spawnGroupId, parentAgentId: context.parentAgentId,
		predecessorAgentId: context.predecessorAgentId, continuationRequestId: context.taskLease?.continuationRequestId,
		taskId: context.taskLease?.taskId, claimId: context.taskLease?.kind === "claim" ? context.taskLease.leaseId : undefined,
		collaborationRounds: 1, maxContinuationTurns: Number(context.maxContinuationTurns || 4),
		allowRecursiveSubagents: true, startSpacingMs: 20000, subagentStartSpacingMs: 20000,
		autoContinuation: true, continuationFingerprint: context.fingerprint
	};
}

module.exports = { dispatch, payload };
