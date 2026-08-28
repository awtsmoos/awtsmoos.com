// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { normalizeSubAgentAuth } from "../subAgents/authShape.js";
import { normalizeSubAgentMissions } from "../subAgents/missionShape.js";
import { KeserSubAgentState } from "../subAgents/state.js";

/**
 * @file Proves Sub-agent state resists stale responses and malformed mission payloads.
 * @description The Awtsmoos renews the newest instant alone; Awtsmoos.com refuses an older network response the crown after a fresher generation has already been born.
 */

const state = new KeserSubAgentState();
assert.equal(state.begin("refresh"), true);
assert.equal(state.begin("refresh"), false);
state.end("refresh");
assert.equal(state.begin("refresh"), true);
state.end("refresh");

const oldGeneration = state.beginRefreshGeneration();
const newGeneration = state.beginRefreshGeneration();
assert.equal(state.acceptRefresh(oldGeneration, { missions: [{ id: "stale" }] }), false);
assert.equal(state.acceptRefresh(newGeneration, { missions: [{ id: "fresh", goal: "Newest evidence" }] }), true);
assert.equal(state.snapshot().missions[0].id, "fresh");

const missions = normalizeSubAgentMissions([{
	websiteMissionId: "mission-1",
	goal: "Reveal the actual agent constellation",
	status: "running",
	subagentBacklog: { count: 4 },
	agents: [{ id: "a1", name: "Keser", depth: 2, status: "working" }]
}]);
assert.equal(missions[0].active, true);
assert.equal(missions[0].backlog, 4);
assert.equal(missions[0].agents[0].depth, 2);
assert.equal(normalizeSubAgentAuth({ authenticated: true, profile: "default" }).authenticated, true);
console.log(JSON.stringify({ ok: true, test: "subAgentsState" }, null, 2));
