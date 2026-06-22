// B"H
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const mission = require("../index.js");
function test(name, fn) { try { fn(); console.log(`✓ ${name}`); } catch (e) { console.error(`✗ ${name}`); throw e; } }
function nativeExpectation(extra = {}) { return { expectedAction: "list", expectedTunnelName: "awt-awtsmoos-7320", expectedVessel: "native-tunnel", ...extra }; }
function nativeActual(extra = {}) { return { actualAction: "list", actualTunnelName: "awt-awtsmoos-7320", actualVessel: "native-tunnel", routeReason: "native_tunnel", ...extra }; }
test("mission initializes with remainingWork", () => { const m = mission.createMission({ title: "T", goal: "G", routeExpectation: { tunnelName: "awt-awtsmoos-7320", vessel: "native-tunnel" } }); assert.ok(m.remainingWork.length); });
test("mission cannot complete while remainingWork exists", () => { const m = mission.createMission({ goal: "G", routeExpectation: { tunnelName: "t", vessel: "native-tunnel" } }); assert.equal(mission.evaluateCompletionGate(m).ok, false); });
test("nextAction is generated when work remains", () => { const m = mission.createMission({ goal: "G" }); assert.ok(m.nextAction && m.nextAction.summary); });
test("self-review finds missing verification", () => { let m = mission.makeMission({ goal: "G" }); m.workGraph.push({ id: "node_1", title: "Bare", status: "planned", verification: [] }); m = mission.reviewMission(m); assert.ok(m.selfReviews.at(-1).requiredFixes.includes("one or more work nodes lack verification")); });
test("checkpoint and handoff files are written", () => { const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mission-engine-")); let m = mission.createMission({ goal: "G" }); m = mission.writeHandoff(m, dir); m = mission.writeCheckpoint(m, dir); assert.ok(fs.existsSync(m.handoffs[0].path)); assert.ok(fs.existsSync(m.checkpoints[0].path)); });
test("readLatestCheckpoint returns latest checkpoint", () => { const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mission-latest-")); let m = mission.createMission({ goal: "G" }); m = mission.writeCheckpoint(m, dir); m = mission.advanceMission(m, { completedWork: "G", remainingWork: "second step", shadowWork: false }); m = mission.writeCheckpoint(m, dir); const latest = mission.readLatestCheckpoint(m.id, dir); assert.equal(latest.checkpoints.length, 2); assert.ok(latest.remainingWork.includes("second step")); });
test("correlationGuard accepts complete native correlation", () => { const res = mission.validateCorrelation(nativeExpectation({ controlRequestId: "ctrl-1" }), nativeActual({ controlRequestId: "ctrl-1" })); assert.equal(res.ok, true); });
test("correlationGuard rejects virtual-os response for native request", () => { const res = mission.validateCorrelation(nativeExpectation(), { actualAction: "list", tunnelName: "awtsmoos-virtual-os", vessel: "virtual-os", routeReason: "explicit_virtual_os" }); assert.equal(res.ok, false); });
test("correlationGuard rejects missing native routeReason", () => { const res = mission.validateCorrelation(nativeExpectation(), nativeActual({ routeReason: undefined })); assert.equal(res.ok, false); assert.ok(res.mismatches.includes("routeReason")); });
test("correlationGuard rejects ambiguous not_native routeReason", () => { const res = mission.validateCorrelation(nativeExpectation(), nativeActual({ routeReason: "not_native" })); assert.equal(res.ok, false); assert.ok(res.mismatches.includes("routeReason")); });
test("correlationGuard rejects wrong action", () => { const res = mission.validateCorrelation({ expectedAction: "list" }, { actualAction: "aiAgentList" }); assert.equal(res.ok, false); });
test("correlationGuard rejects missing controlRequestId when expected", () => { const res = mission.validateCorrelation(nativeExpectation({ controlRequestId: "ctrl-1" }), nativeActual({ controlRequestId: undefined })); assert.equal(res.ok, false); assert.ok(res.mismatches.includes("controlRequestId")); });
test("multiple-choice refuses complete when gates fail", () => { const m = mission.interrogateCompletion(mission.createMission({ goal: "G" })); assert.equal(m.multipleChoiceSelfInterrogations.at(-1).answer, "B"); });
test("shadowWork creates test/doc/review obligations", () => { const m = mission.discoverShadowWork(mission.makeMission({ goal: "G", remainingWork: [] }), { subject: "mission engine" }); assert.ok(m.remainingWork.some(x => /tests/.test(x))); assert.ok(m.remainingWork.some(x => /Document/.test(x))); assert.ok(m.remainingWork.some(x => /delta/.test(x))); });
