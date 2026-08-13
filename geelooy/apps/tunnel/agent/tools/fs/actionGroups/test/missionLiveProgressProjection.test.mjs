// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import LiveProgress from "../../mission/missionLiveProgress.js";

/**
 * @file Proves Tunnel Control receives bounded mission identity, agent state, and recent-plan testimony.
 * @description The Awtsmoos reveals the living Shliach and the work still due;
 * Awtsmoos.com may observe the vessel, yet observation must never alter what is true.
 */
const now = Date.parse("2026-08-13T01:00:00.000Z");
const mission = fixture();
const before = JSON.stringify(mission);
const progress = LiveProgress.build(mission, {
	now,
	staleMs: 120000,
	lock: {
		projectRoot: "/fallback/root",
		lastMustCallNext: "continue-same-mission"
	},
	continuation: {
		status: "running",
		fingerprint: "fingerprint-one",
		attempts: 2,
		recoveryReason: "predecessor_completed",
		predecessorAgentId: "agent-done",
		successorAgentId: "agent-live",
		lastAttemptAt: "2026-08-13T00:59:30.000Z"
	}
});

assert.equal(progress.missionId, "mission-projection");
assert.equal(progress.missionName, "Continuity Room");
assert.equal(progress.projectRoot, "/repo/live");
assert.equal(progress.currentLogicalAgentId, "logical-live");
assert.equal(progress.currentAgentSessionId, "session-live");
assert.equal(progress.lastHeartbeatAt, "2026-08-13T00:59:59.000Z");
assert.equal(progress.heartbeatAgeMs, 1000);
assert.equal(progress.agentState.alive, true);
assert.equal(progress.agentState.ended, false);
assert.equal(progress.recentPlans.length, 8);
assert.equal(progress.latestRecentPlan.id, "plan-9");
assert.equal(progress.nextRequiredAction, "continue-same-mission");
assert.equal(progress.continuation.attempts, 2);
assert.equal(progress.continuation.lastRecoveryAt, "2026-08-13T00:59:30.000Z");
assert.equal(progress.agents.find(agent => agent.agentId === "agent-done").completed, true);
assert.equal(progress.agents.find(agent => agent.agentId === "agent-stop").stopped, true);
assert.equal(JSON.stringify(mission), before);
console.log(JSON.stringify({
	ok: true,
	missionName: progress.missionName,
	currentLogicalAgentId: progress.currentLogicalAgentId,
	recentPlans: progress.recentPlans.length
}));

/** Builds a persisted-shape mission fixture without invoking any mutating observation path. */
function fixture() {
	return {
		id: "mission-projection",
		goal: "Continue one mission",
		status: "active",
		phase: "execute",
		room: {
			name: "Continuity Room",
			projectRoot: "/repo/live",
			agents: [
				agent("agent-live", "logical-live", "session-live", "active", "2026-08-13T00:59:59.000Z"),
				agent("agent-done", "logical-done", "session-done", "completed", "2026-08-13T00:59:58.000Z"),
				agent("agent-stop", "logical-stop", "session-stop", "stopped", "2026-08-13T00:59:57.000Z")
			]
		},
		tasks: [
			{ id: "task-1", title: "Finished", status: "completed" },
			{ id: "task-2", title: "Continue", status: "open" }
		],
		nextPlans: Array.from({ length: 9 }, (_value, index) => ({
			id: `plan-${index + 1}`,
			step: `Step ${index + 1}`,
			status: "open",
			next: `Next ${index + 1}`
		}))
	};
}

/** Creates one room-agent record using the fields persisted by roomAgents.join(). */
function agent(agentId, logicalAgentId, agentSessionId, status, lastSeenAt) {
	return {
		agentId,
		logicalAgentId,
		agentSessionId,
		status,
		lastSeenAt
	};
}
