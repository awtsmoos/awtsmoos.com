//B"H // Boruch Hashem // Blessed is He

const Workspaces = require("../agentWorkspaceStore.js");

/**
 * @file Gives one authenticated Shliach a private working place without moving the shared earth.
 * @description The Awtsmoos renews every messenger in one world; Awtsmoos.com therefore keeps
 * canonical root authority immutable while each logical agent may remember only its own bounded cwd.
 */
function buildAgentWorkspaceActions(context) {
	const { config, payload = {} } = context;
	// Resolve the caller's logical identity at invocation time, not build time.
	// The registration manifest (registration-manifest.js -> actionInventory ->
	// buildActions -> buildFoundationActions) builds EVERY action with an empty
	// payload; throwing here aborts agent registration with missing_logical_agent_id
	// and the route can never come alive (incident 2026-09-20).
	const identity = () => requiredIdentity(payload.logicalAgentId);
	return {
		async agentWorkspaceGet() {
			return response("agentWorkspaceGet", Workspaces.get(config, identity()));
		},
		async agentWorkspaceSet() {
			const requested = payload.workspace || payload.cwd || payload.path || payload.p || ".";
			return response("agentWorkspaceSet", Workspaces.set(config, identity(), requested));
		},
		async agentWorkspaceClear() {
			return response("agentWorkspaceClear", Workspaces.clear(config, identity()));
		}
	};
}

/** Build one non-secret workspace receipt whose identity cannot target another agent. */
function response(action, workspace) {
	return { ok: true, action, workspace };
}

/** Require the transport-normalized logical identity instead of accepting a target-agent field. */
function requiredIdentity(value) {
	const id = String(value || "").trim();
	if (id) return id;
	const error = new Error("missing_logical_agent_id");
	error.code = "missing_logical_agent_id";
	throw error;
}

module.exports = { buildAgentWorkspaceActions, requiredIdentity };
