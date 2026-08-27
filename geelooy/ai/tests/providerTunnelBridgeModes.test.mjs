// B"H
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { EndpointTunnelBridge, makeVirtualOsTunnelBridge, resolveProviderTunnelBridge } from "../central/index.js";

/**
 * B"H — Endpoint bridge proof without touching the network.
 */
const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const [endpointSource, providerBridgeSource, openaiCompatible, centralIndex] = await Promise.all([
  read("central/endpointTunnelBridge.js"),
  read("central/providerTunnelBridge.js"),
  read("openaiCompatible.js"),
  read("central/index.js")
]);

assert.match(endpointSource, /DEFAULT_CONTROL_URL = "\/api\/tunnel\/control"/);
assert.match(endpointSource, /credentials: "include"/);
assert.match(providerBridgeSource, /tunnelMode\(options\)/);
assert.match(providerBridgeSource, /makeVirtualOsTunnelBridge/);
assert.match(openaiCompatible, /resolveProviderTunnelBridge\(options\)/);
assert.match(centralIndex, /EndpointTunnelBridge/);
assert.match(centralIndex, /resolveProviderTunnelBridge/);
assert.equal(await resolveProviderTunnelBridge({ localTunnel: false }), null);
assert.equal(await resolveProviderTunnelBridge({ tunnelMode: "direct" }), null);

const endpointCalls = [];
const endpointBridge = new EndpointTunnelBridge({
  controlUrl: "/api/tunnel/control",
  tunnelName: "awt-demo",
  fetchImpl: fakeFetch(endpointCalls)
});
const endpointResult = await endpointBridge.call("list", { p: "." });
assert.equal(endpointResult.ok, true);
assert.equal(endpointCalls[0].url, "/api/tunnel/control");
assert.equal(endpointCalls[0].init.credentials, "include");
assert.equal(endpointCalls[0].body.action, "list");
assert.equal(endpointCalls[0].body.tunnelName, "awt-demo");
assert.equal(endpointCalls[0].body.p, ".");

const virtualCalls = [];
const virtualBridge = makeVirtualOsTunnelBridge({ fetchImpl: fakeFetch(virtualCalls) });
await virtualBridge.call("read", { p: "main" });
assert.equal(virtualCalls[0].body.action, "read");
assert.equal(virtualCalls[0].body.tunnelName, "awtsmoos-virtual-os");
assert.equal(virtualCalls[0].body.targetVessel, "virtual-os");

function fakeFetch(calls) {
  return async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    return { ok: true, status: 200, json: async () => ({ ok: true }) };
  };
}

console.log("B'H provider tunnel bridge modes regression passed.");
