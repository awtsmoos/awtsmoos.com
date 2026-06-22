// B"H
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const mission = require("../index.js");
function test(name, fn) { try { fn(); console.log(`✓ ${name}`); } catch (e) { console.error(`✗ ${name}`); throw e; } }
test("mission initializes with remainingWork", () => { const m = mission.createMission({ title: "T", goal: "G", routeExpectation: { tunnelName: "awt-awtsmoos-7320", vessel: "native-tunnel" } }); assert.ok(m.remainingWork.length); });
test("mission cannot complete while remainingWork exists", () => { const m = mission.createMission({ goal: "G", routeExpectation: { tunnelName: "t", vessel: "native-tunnel" } }); assert.equal(mission.evaluateCompletionGate(m).ok, false); });
test("nextAction is generated when work remains", () => { const m = mission.createMission({ goal: "G" }); assert.ok(m.nextAction && m.nextAction.summary); });
test("self-review finds missing verification", () => { let m = mission.makeMission({ goal: "G" }); m.workGraph.push({ id: "node_1", title: "Bare", status: "planned", verification: [] }); m = mission.reviewMission(m); assert.ok(m.selfReviews.at(-1).requiredFixes.includes("one or more work nodes lack verification")); });
test("checkpoint and handoff files are written", () => { const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mission-engine-")); let m = mission.createMission({ goal: "G" }); m = mission.writeHandoff(m, dir); m = mission.writeCheckpoint(m, dir); assert.ok(fs.existsSync(m.handoffs[0].path)); assert.ok(fs.existsSync(m.checkpoints[0].path)); });
test("correlationGuard rejects virtual-os response for native request", () => { const res = mission.validateCorrelation({ expectedAction: "list", expectedTunnelName: "awt-awtsmoos-7320", expectedVessel: "native-tunnel" }, { actualAction: "list", tunnelName: "awtsmoos-virtual-os", vessel: "virtual-os", routeReason: "explicit_virtual_os" }); assert.equal(res.ok, false); });
test("correlationGuard rejects wrong action", () => { const res = mission.validateCorrelation({ expectedAction: "list" }, { actualAction: "aiAgentList" }); assert.equal(res.ok, false); });
test("multiple-choice refuses complete when gates fail", () => { const m = mission.interrogateCompletion(mission.createMission({ goal: "G" })); assert.equal(m.multipleChoiceSelfInterrogations.at(-1).answer, "B"); });
test("shadowWork creates test/doc/review obligations", () => { const m = mission.discoverShadowWork(mission.makeMission({ goal: "G", remainingWork: [] }), { subject: "mission engine" }); assert.ok(m.remainingWork.some(x => /tests/.test(x))); assert.ok(m.remainingWork.some(x => /Document/.test(x))); assert.ok(m.remainingWork.some(x => /delta/.test(x))); });
test("command-like actions use async paged no-504 policy", () => { const p = mission.makeConcurrencyPolicy(); const plan = mission.planToolExecution("command", p); assert.equal(plan.asyncFirst, true); assert.equal(plan.inlineOutput, false); assert.ok(plan.waitTimeoutMs < p.commandStartTimeoutMs); });
test("agent leases cap concurrent agents", () => { let store = mission.makeLeaseStore({ maxConcurrentAgents: 2 }); let a = mission.acquireLease(store, { agentId: "a" }); let b = mission.acquireLease(a.store, { agentId: "b" }); let c = mission.acquireLease(b.store, { agentId: "c" }); assert.equal(a.ok, true); assert.equal(b.ok, true); assert.equal(c.ok, false); });
test("route health throttles after repeated failures", () => { let h = mission.makeRouteHealth(); h = mission.recordRouteSample(h, { ok: false, vessel: "virtual-os", routeReason: "explicit_virtual_os" }); h = mission.recordRouteSample(h, { ok: false, vessel: "virtual-os", routeReason: "explicit_virtual_os" }); assert.equal(mission.shouldThrottle(h), true); });
