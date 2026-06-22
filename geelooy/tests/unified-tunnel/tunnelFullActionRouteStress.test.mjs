// B"H
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { actions } = require("../../api/tunnel/control/docs/actions.js");

const memory = new Map([["awtTargetVesselName", "awtsmoos-virtual-os"]]);
global.location = { origin: "https://awtsmoos.test" };
global.localStorage = { getItem(key) { return memory.get(key) || null; }, setItem(key, value) { memory.set(key, String(value)); } };

const { buildFsUrl, resolveTargetTunnelName } = await import("../../apps/tunnel-control/js/api/tunnel.js");

const nativeNames = ["awt-awtsmoos-7320", "awt-shadow-nesher-1782079958878"];
assert(actions.length > 250, "public tunnel action surface should be broad");

let checked = 0;
for (const action of actions) {
  for (const tunnel of nativeNames) {
    const url = new URL(buildFsUrl(tunnel, payload(action, checked)));
    assert.equal(url.pathname, "/api/tunnel/control/fs/" + encodeURIComponent(tunnel), `${action} rerouted ${tunnel}`);
    assert.equal(url.searchParams.get("targetVessel"), tunnel, `${action} changed targetVessel for ${tunnel}`);
    checked++;
  }
}

for (const action of ["command", "payloadEcho", "commandStatus", "missionAutopilot", "missionBrainstorm"]) {
  assert.equal(resolveTargetTunnelName("auto", payload(action)), "auto");
  let url = new URL(buildFsUrl("auto", payload(action)));
  assert.equal(url.pathname, "/api/tunnel/control/fs/auto");
  assert.equal(url.searchParams.get("targetVessel"), "auto");
  url = new URL(buildFsUrl("auto", { ...payload(action), targetVessel: "native-local" }));
  assert.equal(url.pathname, "/api/tunnel/control/fs/auto");
  assert.equal(url.searchParams.get("targetVessel"), "native-local");
  url = new URL(buildFsUrl(nativeNames[0], { ...payload(action), targetVessel: "virtual-os" }));
  assert.equal(url.pathname, "/api/tunnel/control/fs/awtsmoos-virtual-os");
  assert.equal(url.searchParams.get("targetVessel"), "virtual-os");
}

function payload(action, index = 0) {
  return {
    action,
    path: ".",
    p: ".",
    command: "pwd",
    text: "BHY route stress",
    message: "BHY route stress",
    prompt: "BHY route stress",
    id: "job-" + index,
    jobId: "job-" + index,
    missionId: "mission_route_stress",
    maxChars: 120,
    timeoutMs: 1000
  };
}

console.log(JSON.stringify({ ok: true, suite: "tunnel-full-action-route-stress", actions: actions.length, checked, staleMemory: memory.get("awtTargetVesselName") }, null, 2));
