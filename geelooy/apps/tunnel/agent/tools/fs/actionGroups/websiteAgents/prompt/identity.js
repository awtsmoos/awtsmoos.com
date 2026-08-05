// B"H
// Boruch Hashem
// Blessed is He

const Scopes = require("../plannerScopes.js");

/**
 * @file Binds every website turn to one canonical root, scope, and stable identity.
 * @description
 * The Awtsmoos names the shliach's vessel before the task begins. Awtsmoos.com
 * repeats relative and absolute boundaries and one mission-session-round key so
 * queue replay prevention and filesystem containment share the same durable truth.
 */
function assignment(record, agent) {
	const projectRoot = Scopes.canonicalProjectRoot(record.plan?.projectRoot);
	const scope = Scopes.scopeDescriptor(projectRoot, agent.scope);
	if (!scope) {
		const error = new Error("website_agent_scope_outside_project_root");
		error.code = "website_agent_scope_outside_project_root";
		throw error;
	}
	return [
		"Canonical project root:",
		projectRoot,
		"",
		"Claimed relative scope:",
		scope.relativeScope,
		"",
		"Claimed absolute scope:",
		scope.absoluteScope,
		"",
		"Stable turn identity:",
		stableTurnIdentity(record, agent)
	].join("\n");
}

function stableTurnIdentity(record, agent) {
	const session = String(agent.agentSessionId || `${record.id}:${agent.id}`);
	const pendingRound = Number(agent.pendingRound || 0);
	const round = pendingRound || Number(agent.round || 0) + 1;
	return `website:${record.id || record.missionId}:${session}:round-${round}`;
}

module.exports = { assignment, stableTurnIdentity };
