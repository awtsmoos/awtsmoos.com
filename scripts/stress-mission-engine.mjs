// B"H
import { createRequire } from "module";
import fs from "fs";
import os from "os";
import path from "path";
const require = createRequire(import.meta.url);
const mission = require("../geelooy/ai/mission/index.js");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-mission-stress-"));
let state = mission.createMission({ title: "Stress Mission Engine", goal: "Verify continuation, checkpoint, handoff, and route safety", routeExpectation: { tunnelName: "awt-awtsmoos-7320", vessel: "native-tunnel" }, remainingWork: ["inspect", "test", "handoff"] });
state = mission.advanceMission(state, { completedWork: "inspect", subject: "stress mission engine", summary: "Inspection simulated" });
state = mission.reviewMission(state);
state = mission.interrogateCompletion(state);
state = mission.writeHandoff(state, tempDir);
state = mission.writeCheckpoint(state, tempDir);
const badRoute = mission.validateCorrelation({ expectedAction: "list", expectedTunnelName: "awt-awtsmoos-7320", expectedVessel: "native-tunnel" }, { actualAction: "list", tunnelName: "awtsmoos-virtual-os", vessel: "virtual-os", routeReason: "explicit_virtual_os" });
const gate = mission.evaluateCompletionGate(state);
const summary = { ok: state.remainingWork.length > 0 && state.nextAction && badRoute.ok === false && gate.ok === false, missionId: state.id, checkpointCount: state.checkpoints.length, handoffCount: state.handoffs.length, badRouteRejected: badRoute.ok === false, gateOk: gate.ok, tempDir };
console.log(JSON.stringify(summary, null, 2));
if (!summary.ok) process.exit(1);
