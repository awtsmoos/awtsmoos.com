// B"H
const assert = require("assert");
const { resolveFsVessel, requestedVesselType } = require("../resolveFsVessel.js");

function client(tunnelName, extra = {}) {
  return { isTunnel: true, isAlive: true, tunnelName, registeredAt: Date.now(), ...extra };
}

function ctx(clients = []) {
  return { ws: { clients, sendTunnelRequest: async (name, payload) => ({ ok: true, name, payload }) } };
}

const native = client("native-one", { allowWrite: true, allowCommands: true });
const browser = client("browser-one", { browserAgent: true, vesselType: "browser-tab", allowWrite: true });
const $i = ctx([native, browser]);

assert.strictEqual(requestedVesselType("awtsmoos-virtual-os", {}), "virtual-os");
assert.strictEqual(requestedVesselType("native-one", { targetVessel: "browser-tab" }), "browser-tab");
assert.strictEqual(requestedVesselType("auto", { targetVessel: "native-local" }), "native-tunnel");
assert.strictEqual(requestedVesselType("native-one", { fallback: "virtual-os" }), "");
assert.strictEqual(requestedVesselType("native-one", { routeHints: { fallback: "virtual-os" } }), "");
assert.strictEqual(requestedVesselType("native-one", { root: "awtsmoos-virtual-os" }), "");
assert.strictEqual(requestedVesselType("native-one", { routeHints: { root: "awtsmoos-virtual-os" } }), "");
assert.strictEqual(requestedVesselType("auto", { fallback: "virtual-os" }), "virtual-os");

let v = resolveFsVessel({ $i, userId: "u", tunnelName: "native-one", payload: { targetVessel: "virtual-os" } });
assert.strictEqual(v.kind, "virtual-os");
assert.strictEqual(v.tunnelName, "awtsmoos-virtual-os");
assert.strictEqual(v.reason, "explicit_virtual_os");

v = resolveFsVessel({ $i, userId: "u", tunnelName: "browser-one", payload: { targetVessel: "browser-tab" } });
assert.strictEqual(v.kind, "browser-tab");
assert.strictEqual(v.reason, "explicit_browser_tab");

v = resolveFsVessel({ $i, userId: "u", tunnelName: "auto", payload: { targetVessel: "native-local" } });
assert.strictEqual(v.kind, "native-tunnel");
assert.strictEqual(v.tunnelName, "native-one");

v = resolveFsVessel({ $i, userId: "u", tunnelName: "native-one", payload: { targetVessel: "native" } });
assert.strictEqual(v.kind, "native-tunnel");
assert.strictEqual(v.reason, "explicit_native");

for (const action of ["read", "list", "commandBatch"]) {
  v = resolveFsVessel({ $i, userId: "u", tunnelName: "native-one", payload: { action, fallback: "virtual-os" } });
  assert.strictEqual(v.kind, "native-tunnel");
  assert.strictEqual(v.tunnelName, "native-one");
  assert.strictEqual(v.reason, "exact_native_tunnel");
}

v = resolveFsVessel({ $i, userId: "u", tunnelName: "native-one", payload: { action: "read", routeHints: { fallback: "virtual-os" } } });
assert.strictEqual(v.kind, "native-tunnel");
assert.strictEqual(v.reason, "exact_native_tunnel");

v = resolveFsVessel({ $i, userId: "u", tunnelName: "native-one", payload: { action: "read", routeHints: { root: "awtsmoos-virtual-os" } } });
assert.strictEqual(v.kind, "native-tunnel");
assert.strictEqual(v.reason, "exact_native_tunnel");

v = resolveFsVessel({ $i, userId: "u", tunnelName: "auto", payload: {} });
assert.strictEqual(v.kind, "browser-tab");
assert.strictEqual(v.reason, "auto_single_browser_tab");

v = resolveFsVessel({ $i: ctx([native]), userId: "u", tunnelName: "auto", payload: {} });
assert.strictEqual(v.kind, "native-tunnel");
assert.strictEqual(v.reason, "auto_single_native_tunnel");

v = resolveFsVessel({ $i: ctx([]), userId: "u", tunnelName: "auto", payload: {} });
assert.strictEqual(v.kind, "virtual-os");
assert.strictEqual(v.reason, "auto_virtual_os");

console.log("BHY resolveFsVessel tests passed");
