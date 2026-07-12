// B"H
const test = require("node:test");
const assert = require("node:assert/strict");
const Runtime = require("../index.js");

function agent(agentId = "agent-a") {
	return Runtime.agentRuntime.createAgentRuntime({
		agentId,
		logicalAgentId: agentId,
		agentSessionId: `${agentId}-session-1`,
		missionId: "mission-1",
		roomId: "room-1"
	});
}

test("mission graph rejects cycles", () => {
	assert.throws(() => Runtime.missionGraph.createGraph({
		missionId: "mission-cycle",
		nodes: [
			{ nodeId: "a", dependencies: ["b"] },
			{ nodeId: "b", dependencies: ["a"] }
		]
	}), { code: "mission_graph_cycle" });
});

test("mission graph releases dependencies only after completion", () => {
	let graph = Runtime.missionGraph.createGraph({
		missionId: "mission-graph",
		nodes: [
			{ nodeId: "plan" },
			{ nodeId: "build", dependencies: ["plan"] },
			{ nodeId: "verify", dependencies: ["build"] }
		]
	});
	assert.deepEqual(Runtime.missionGraph.runnableNodes(graph).map(node => node.nodeId), ["plan"]);
	graph = Runtime.missionGraph.transitionNode(graph, "plan", { observedState: "completed" }, 0);
	assert.deepEqual(Runtime.missionGraph.runnableNodes(graph).map(node => node.nodeId), ["build"]);
	assert.throws(() => Runtime.missionGraph.transitionNode(graph, "plan", {}, 0), { code: "node_revision_conflict" });
});

test("individual agents own independent pause and one-turn state", () => {
	let first = agent("agent-a");
	let second = agent("agent-b");
	first = Runtime.agentRuntime.applyControl(first, "pause", { expectedRevision: 0 });
	assert.equal(Runtime.agentRuntime.beforeTurn(first).reason, "paused");
	assert.equal(Runtime.agentRuntime.beforeTurn(second).ok, true);
	first = Runtime.agentRuntime.applyControl(first, "one-turn", { expectedRevision: first.revision });
	const ticket = Runtime.agentRuntime.beforeTurn(first, { nodeId: "task-1" });
	assert.equal(ticket.ok, true);
	assert.equal(ticket.oneTurn, true);
	first = Runtime.agentRuntime.afterTurn(ticket.runtime, { resultRef: "result://1" });
	assert.equal(first.observedState, "paused");
	assert.equal(first.oneTurnCredits, 0);
});

test("drain and stop block new turns with revision checks", () => {
	let runtime = agent();
	runtime = Runtime.agentRuntime.applyControl(runtime, "drain", { expectedRevision: 0 });
	assert.equal(Runtime.agentRuntime.beforeTurn(runtime).reason, "draining");
	assert.throws(() => Runtime.agentRuntime.applyControl(runtime, "stop", { expectedRevision: 0 }), {
		code: "agent_revision_conflict"
	});
	runtime = Runtime.agentRuntime.applyControl(runtime, "stop", { expectedRevision: runtime.revision });
	assert.equal(Runtime.agentRuntime.beforeTurn(runtime).reason, "stopped");
});

test("checkpoints bind mission and agent session lineage", () => {
	let runtime = agent();
	runtime = Runtime.agentRuntime.checkpoint(runtime, {
		checkpointId: "checkpoint-1",
		filesTouched: ["file-a.js"],
		testsRun: ["mission.test.cjs"],
		resumeToken: "resume-1"
	});
	assert.equal(runtime.lastCheckpoint.agentSessionId, "agent-a-session-1");
	assert.equal(runtime.lastCheckpoint.missionId, "mission-1");
});
