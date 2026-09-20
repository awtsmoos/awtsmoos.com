/**
 * Regression test — incident 2026-09-20.
 *
 * The registration manifest builder (registration-manifest.js -> actionInventory ->
 * buildActions -> buildFoundationActions) builds EVERY action with an empty payload.
 * buildAgentWorkspaceActions() used to call requiredIdentity(payload.logicalAgentId)
 * at BUILD time, which threw missing_logical_agent_id and aborted registerReady(),
 * so the rescue route could never register (relay: connected:false/isAlive:false,
 * dispatches 409 tunnel_not_alive).
 *
 * The fix resolves the logical identity lazily inside each handler. This test pins
 * both sides: manifest-style builds with an empty payload must not throw, AND a real
 * invocation without a logicalAgentId must still reject with missing_logical_agent_id.
 */
const test = require("node:test");
const assert = require("node:assert/strict");

const mod = require("../tools/fs/actionGroups/agentWorkspaceActions.js");
const buildAgentWorkspaceActions = mod.buildAgentWorkspaceActions || mod;
assert.equal(
	typeof buildAgentWorkspaceActions,
	"function",
	"agentWorkspaceActions.js must export buildAgentWorkspaceActions"
);

test("manifest inventory build with empty payload does not throw", () => {
	assert.doesNotThrow(() => buildAgentWorkspaceActions({ config: {}, payload: {} }));
});

test("manifest inventory build with missing payload does not throw", () => {
	assert.doesNotThrow(() => buildAgentWorkspaceActions({ config: {} }));
});

test("invocation without logicalAgentId rejects with missing_logical_agent_id", async () => {
	const actions = buildAgentWorkspaceActions({ config: {}, payload: {} });
	for (const name of ["agentWorkspaceGet", "agentWorkspaceSet", "agentWorkspaceClear"]) {
		await assert.rejects(
			() => actions[name](),
			/missing_logical_agent_id/,
			`${name}() without an identity must reject`
		);
	}
});
