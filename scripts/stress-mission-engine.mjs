// B"H
import { createRequire } from "module";
import assert from "assert/strict";
import fs from "fs";
import os from "os";
import path from "path";
const require = createRequire(import.meta.url);
const mission = require("../geelooy/ai/mission/index.js");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-mission-stress-"));
const agents = [
  ["mitzvah-world", "/Users/awtsmoos/Documents/mitzvah-world", "awt-awtsmoos-7320"],
  ["ohr-hagnuz", "/Users/awtsmoos/Documents/ohr-hagnuz", "awt-ohr-hagnuz-7320"],
  ["hud-renderer", "/Users/awtsmoos/Documents/ohr-hagnuz/HudRenderer.js", "awt-hud-renderer-7320"],
  ["awtsmoos-main", "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com", "awt-awtsmoos-7320"],
  ["docs-agent", "/Users/awtsmoos/Documents/docs", "awt-docs-7320"],
  ["review-agent", "/Users/awtsmoos/Documents/review", "awt-review-7320"],
  ["native-audit", "/Users/awtsmoos/Documents/native-audit", "awt-native-audit-7320"],
  ["virtual-decoy", "/Users/awtsmoos/Documents/virtual-decoy", "awt-virtual-decoy-7320"],
  ["checkpoint-agent", "/Users/awtsmoos/Documents/checkpoints", "awt-checkpoint-7320"],
  ["handoff-agent", "/Users/awtsmoos/Documents/handoffs", "awt-handoff-7320"]
];
const parameterSets = [
  { suffix: "basic", remainingWork: ["inspect", "test", "handoff"], shadowWork: true },
  { suffix: "empty-title", title: "", goal: "Goal only mission", remainingWork: ["goal-check"], shadowWork: false },
  { suffix: "duplicate-work", remainingWork: ["same", "same", "verify"], shadowWork: true },
  { suffix: "unicode-like", remainingWork: ["B'H marker", "route/correlation", "planned-vs-actual"], shadowWork: false },
  { suffix: "long-work", remainingWork: ["x".repeat(120), "review evidence", "write continuation"], shadowWork: true },
  { suffix: "single-work", remainingWork: ["single"], shadowWork: false },
  { suffix: "null-route-extra", remainingWork: ["native expectation added later"], shadowWork: true },
  { suffix: "many-work", remainingWork: Array.from({ length: 8 }, (_, i) => `step-${i}`), shadowWork: false }
];
const actions = ["list", "read", "search", "aiAgentTaskStatus", "missionNext", "payloadEcho"];
const routeReasons = ["native", "native_tunnel", "native-tunnel", "native_route", "native-route"];
function nativeExpected(agent, action, index) {
  return { expectedAction: action, expectedTunnelName: agent[2], expectedVessel: "native-tunnel", controlRequestId: `ctrl-${agent[0]}-${index}` };
}
function nativeActual(agent, action, index, routeReason = "native_tunnel") {
  return { actualAction: action, actualTunnelName: agent[2], actualVessel: "native-tunnel", controlRequestId: `ctrl-${agent[0]}-${index}`, routeReason };
}
function badResponses(agent, action, index) {
  return [
    { actualAction: action, tunnelName: "awtsmoos-virtual-os", vessel: "virtual-os", controlRequestId: `ctrl-${agent[0]}-${index}`, routeReason: "explicit_virtual_os" },
    { actualAction: actions[(actions.indexOf(action) + 1) % actions.length], actualTunnelName: agent[2], actualVessel: "native-tunnel", controlRequestId: `ctrl-${agent[0]}-${index}`, routeReason: "native_tunnel" },
    { actualAction: action, actualTunnelName: `${agent[2]}-wrong`, actualVessel: "native-tunnel", controlRequestId: `ctrl-${agent[0]}-${index}`, routeReason: "native_tunnel" },
    { actualAction: action, actualTunnelName: agent[2], actualVessel: "virtual-os", controlRequestId: `ctrl-${agent[0]}-${index}`, routeReason: "native_tunnel" },
    { actualAction: action, actualTunnelName: agent[2], actualVessel: "native-tunnel", controlRequestId: `wrong-${index}`, routeReason: "native_tunnel" },
    { actualAction: action, actualTunnelName: agent[2], actualVessel: "native-tunnel", controlRequestId: `ctrl-${agent[0]}-${index}`, routeReason: "explicit_virtual_os" },
    { actualAction: action, actualTunnelName: agent[2], actualVessel: "native-tunnel", controlRequestId: `ctrl-${agent[0]}-${index}` },
    { actualAction: action, actualTunnelName: agent[2], actualVessel: "native-tunnel", controlRequestId: `ctrl-${agent[0]}-${index}`, routeReason: "not_native" },
    { actualAction: action, actualTunnelName: agent[2], actualVessel: "native-tunnel", routeReason: "native_tunnel" }
  ];
}
let acceptedCorrelation = 0;
let rejectedCorrelation = 0;
for (let ai = 0; ai < agents.length; ai++) {
  for (let actionIndex = 0; actionIndex < actions.length; actionIndex++) {
    const action = actions[actionIndex];
    const expected = nativeExpected(agents[ai], action, actionIndex);
    for (const reason of routeReasons) {
      assert.equal(mission.validateCorrelation(expected, nativeActual(agents[ai], action, actionIndex, reason)).ok, true);
      acceptedCorrelation += 1;
    }
    for (const bad of badResponses(agents[ai], action, actionIndex)) {
      assert.equal(mission.validateCorrelation(expected, bad).ok, false, JSON.stringify({ expected, bad }));
      rejectedCorrelation += 1;
    }
  }
}
const missions = [];
for (let ai = 0; ai < agents.length; ai++) {
  const agent = agents[ai];
  for (let pi = 0; pi < parameterSets.length; pi++) {
    const params = parameterSets[pi];
    const title = params.title === undefined ? `${agent[0]} ${params.suffix}` : params.title;
    let state = mission.createMission({
      id: `mission_${agent[0]}_${params.suffix}`.replace(/[^a-zA-Z0-9_.-]/g, "_"),
      title,
      goal: params.goal || `Verify ${agent[0]} ${params.suffix} continuation`,
      routeExpectation: params.suffix === "null-route-extra" ? null : { tunnelName: agent[2], vessel: "native-tunnel", projectRoot: agent[1] },
      remainingWork: params.remainingWork
    });
    if (!state.routeExpectation) state.routeExpectation = { tunnelName: agent[2], vessel: "native-tunnel", projectRoot: agent[1] };
    state = mission.advanceMission(state, { completedWork: params.remainingWork[0], subject: `${agent[0]}-${params.suffix}`, summary: `Agent ${agent[0]} advanced ${params.suffix}`, shadowWork: params.shadowWork });
    state = mission.addDelta(state, params.remainingWork, [params.remainingWork[0]], state.remainingWork);
    state = mission.reviewMission(state);
    state = mission.interrogateCompletion(state);
    state = mission.writeHandoff(state, tempDir);
    state = mission.writeCheckpoint(state, tempDir);
    state = mission.advanceMission(state, { remainingWork: `follow-up-${agent[0]}-${params.suffix}`, subject: `checkpoint-${agent[0]}-${params.suffix}`, summary: "Post-checkpoint discovery", shadowWork: false });
    state = mission.writeCheckpoint(state, tempDir);
    const prompt = mission.buildContinuationPrompt(state);
    const gate = mission.evaluateCompletionGate(state);
    const latest = mission.readLatestCheckpoint(state.id, tempDir);
    const handoff = fs.readFileSync(state.handoffs.at(-1).path, "utf8");
    assert.equal(gate.ok, false);
    assert.ok(gate.failures.includes("remainingWork is not empty"));
    assert.ok(state.nextAction && state.nextAction.summary);
    assert.ok(state.remainingWork.includes(`follow-up-${agent[0]}-${params.suffix}`));
    assert.ok(state.questions.length >= 10);
    assert.ok(state.questions.every(q => q.answer));
    assert.ok(state.evidence.length >= 2);
    assert.ok(state.deltas.length >= 1);
    assert.ok(state.multipleChoiceSelfInterrogations.at(-1).answer === "B");
    assert.ok(prompt.includes(state.id));
    assert.ok(prompt.includes("Remaining work:"));
    assert.ok(handoff.includes("## Evidence"));
    assert.ok(handoff.includes("Next action:"));
    assert.ok(handoff.includes("Mail-to-self mode"));
    assert.equal(latest.id, state.id);
    assert.equal(latest.checkpoints.length, 2);
    assert.ok(!latest.remainingWork.some(item => item.includes(agents[(ai + 1) % agents.length][0])));
    missions.push(state);
  }
}
const uniqueIds = new Set(missions.map(item => item.id));
const checkpointPaths = missions.flatMap(item => item.checkpoints.map(checkpoint => checkpoint.path));
const handoffPaths = missions.flatMap(item => item.handoffs.map(handoff => handoff.path));
assert.equal(uniqueIds.size, missions.length);
assert.equal(new Set(checkpointPaths).size, checkpointPaths.length);
assert.equal(new Set(handoffPaths).size, handoffPaths.length);
const summary = {
  ok: true,
  simulatedAgents: agents.length,
  parameterSets: parameterSets.length,
  missionCount: missions.length,
  checkpointCount: checkpointPaths.length,
  handoffCount: handoffPaths.length,
  acceptedCorrelation,
  rejectedCorrelation,
  latestCheckpointVerified: missions.length,
  gatesFailedWithNextAction: missions.filter(item => !mission.evaluateCompletionGate(item).ok && item.nextAction).length,
  tempDir
};
console.log(JSON.stringify(summary, null, 2));
