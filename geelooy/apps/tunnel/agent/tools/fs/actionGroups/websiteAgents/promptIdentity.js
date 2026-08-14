// B"H
// Boruch Hashem
// Blessed is He

const Scopes = require("./plannerScopes.js");

/**
 * @file Builds the immutable identity and scope prelude for every website turn.
 * @description
 * The Awtsmoos names one mission spark once. Awtsmoos.com binds that stable turn
 * to a canonical project root plus matching relative and absolute scopes, so the
 * durable queue suppresses duplicate POSTs and every command remains inside root.
 */
function assignment(record, agent) {
	const projectRoot = Scopes.canonicalProjectRoot(record.plan?.projectRoot);
	const scope = Scopes.scopeDescriptor(projectRoot, agent.scope);
	if (!scope) {
		const error = new Error("website_agent_scope_outside_project_root");
		error.code = "website_agent_scope_outside_project_root";
		throw error;
	}
	return {
		projectRoot,
		relativeScope: scope.relativeScope,
		absoluteScope: scope.absoluteScope,
		turnIdentity: stableTurnIdentity(record, agent)
	};
}

function assignmentBlock(record, agent) {
	const identity = assignment(record, agent);
	return [
		"Canonical project root:",
		identity.projectRoot,
		"",
		"Claimed relative scope:",
		identity.relativeScope,
		"",
		"Claimed absolute scope:",
		identity.absoluteScope,
		"",
		"Stable turn identity:",
		identity.turnIdentity
	].join("\n");
}

function stableTurnIdentity(record, agent) {
	const session = String(agent.agentSessionId || `${record.id}:${agent.id}`);
	const pendingRound = Number(agent.pendingRound || 0);
	const turnRound = pendingRound || Number(agent.round || 0) + 1;
	return `website:${record.id || record.missionId}:${session}:round-${turnRound}`;
}

module.exports = {
	assignment,
	assignmentBlock,
	stableTurnIdentity
};
