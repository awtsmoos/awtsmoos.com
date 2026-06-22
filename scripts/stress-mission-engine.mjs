// B"H
import { createRequire } from "module";
import fs from "fs";
import os from "os";
import path from "path";
const require = createRequire(import.meta.url);
const mission = require("../geelooy/ai/mission/index.js");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-mission-stress-"));
const policy = mission.makeConcurrencyPolicy({ maxConcurrentAgents: 8 });
let leaseStore = mission.makeLeaseStore(policy);
const missions = [];
let rejectedLeases = 0;
for (let i = 0; i < 50; i += 1) {
  const lease = mission.acquireLease(leaseStore, { agentId: `agent_${i}`, ttlMs: 60000 });
  if (!lease.ok) { rejectedLeases += 1; continue; }
  leaseStore = lease.store;
  let state = mission.createMission({ title: `Stress Mission ${i}`, goal: "Concurrent resumable work", routeExpectation: { tunnelName: "awt-awtsmoos-7320", vessel: "native-tunnel" }, remainingWork: ["inspect", "test", "handoff"] });
  state = mission.advanceMission(state, { completedWork: "inspect", subject: `mission ${i}`, summary: "Concurrent slice simulated" });
  state = mission.reviewMission(state);
  state = mission.interrogateCompletion(state);
  state = mission.writeHandoff(state, tempDir);
  state = mission.writeCheckpoint(state, tempDir);
  leaseStore = mission.releaseLease(leaseStore, lease.lease.id);
  missions.push(state);
}
const commandPlan = mission.planToolExecution("command", policy);
const badRoute = mission.validateCorrelation({ expectedAction: "list", expectedTunnelName: "awt-awtsmoos-7320", expectedVessel: "native-tunnel" }, { actualAction: "list", tunnelName: "awtsmoos-virtual-os", vessel: "virtual-os", routeReason: "explicit_virtual_os" });
let health = mission.makeRouteHealth();
health = mission.recordRouteSample(health, { ok: false, vessel: "virtual-os", routeReason: "explicit_virtual_os" });
health = mission.recordRouteSample(health, { ok: false, vessel: "virtual-os", routeReason: "explicit_virtual_os" });
const summary = { ok: missions.length === 50 && badRoute.ok === false && commandPlan.asyncFirst && commandPlan.inlineOutput === false && mission.shouldThrottle(health), missions: missions.length, rejectedLeases, checkpointCount: missions.reduce((n, m) => n + m.checkpoints.length, 0), handoffCount: missions.reduce((n, m) => n + m.handoffs.length, 0), commandPlan, routeThrottle: mission.shouldThrottle(health), tempDir };
console.log(JSON.stringify(summary, null, 2));
if (!summary.ok) process.exit(1);
