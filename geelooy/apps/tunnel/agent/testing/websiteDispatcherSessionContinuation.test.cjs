//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");

const Lifecycle = require("../tools/fs/actionGroups/websiteAgents/runner/dispatcherSessionLifecycle.js");

/**
 * @file Proves natural browser termination enters native Mission continuation.
 * @description
 * The Awtsmoos lets a visible chat vessel close without erasing the deed it carried. These tests
 * prove Awtsmoos.com passes terminal dispatcher sessions into the shared-Shliach continuation
 * bridge while a still-running browser turn remains untouched and cannot summon a duplicate heir.
 */

/**
 * Build one browser-runner record around the same autonomous dispatcher identity.
 * @param {string} status Website-runner status to project into session lifecycle truth.
 * @param {string} [agentStatus="complete"] Child-agent status used for failure classification.
 * @returns {object} Portable runner record consumed by the lifecycle module.
 */
function record(status, agentStatus = "complete") {
	return {
		id: `website_${status}`,
		status,
		agents: [{ status: agentStatus }],
		plan: {
			dispatcherSession: {
				agentSessionId: "session_browser_one",
				autonomous: true
			}
		}
	};
}

/**
 * Create deterministic close/continuation collaborators and their observable call ledger.
 * @returns {{calls: object[], sessions: object, continuationBridge: object}} Test dependencies.
 */
function harness() {
	const calls = [];
	const session = {
		id: "session_browser_one",
		logicalAgentId: "agent_browser_one",
		activeMissionId: "mission_one"
	};

	return {
		calls,
		sessions: {
			async close(_config, identity, status) {
				calls.push({ type: "close", identity, status });
				return { ...session, status };
			}
		},
		continuationBridge: {
			async afterClose(_config, closed, options) {
				calls.push({ type: "continue", closed, options });
				return { ok: true, reason: "continuation_pulsed" };
			}
		}
	};
}

test("failed browser Shliach exhausts its session and pulses shared continuation", async () => {
	const dependencies = harness();
	const result = await Lifecycle.settle({}, record("failed", "failed"), dependencies);

	assert.equal(result.ok, true);
	assert.equal(result.status, "exhausted");
	assert.deepEqual(dependencies.calls.map(call => call.type), ["close", "continue"]);
	assert.equal(dependencies.calls[1].closed.status, "exhausted");
	assert.equal(dependencies.calls[1].options.transport, "shared_shliach");
});

test("clean browser completion pulses the debt gate before deciding whether to stop", async () => {
	const dependencies = harness();
	const result = await Lifecycle.settle({}, record("complete"), dependencies);

	assert.equal(result.status, "ended");
	assert.deepEqual(dependencies.calls.map(call => call.type), ["close", "continue"]);
});

test("active browser turn never closes its session or pulses a successor", async () => {
	const dependencies = harness();
	const result = await Lifecycle.settle({}, record("running"), dependencies);

	assert.equal(result.skipped, true);
	assert.equal(result.reason, "website_session_still_active");
	assert.deepEqual(dependencies.calls, []);
});
