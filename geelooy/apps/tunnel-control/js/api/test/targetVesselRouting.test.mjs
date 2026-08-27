// B"H
import assert from "assert";

const memory = new Map([["awtTargetVesselName", "browser-one"]]);
global.location = { origin: "https://awtsmoos.test" };
global.localStorage = { getItem(key) { return memory.get(key) || null; }, setItem(key, value) { memory.set(key, String(value)); } };

const { buildFsUrl, resolveTargetTunnelName } = await import("../tunnel.js");
assert.strictEqual(resolveTargetTunnelName("native-one", {}), "native-one");
assert.strictEqual(resolveTargetTunnelName("native-one", { action: "command", command: "pwd" }), "native-one");
assert.strictEqual(resolveTargetTunnelName("awt-awtsmoos-7320", { action: "payloadEcho", text: "BHY" }), "awt-awtsmoos-7320");
assert.strictEqual(resolveTargetTunnelName("awt-shadow-nesher-1782079958878", { action: "commandStatus", id: "job-1" }), "awt-shadow-nesher-1782079958878");
assert.strictEqual(resolveTargetTunnelName("auto", {}), "auto");
assert.strictEqual(resolveTargetTunnelName("", {}), "auto");
assert.strictEqual(resolveTargetTunnelName("auto", { targetVessel: "native-local" }), "auto");
assert.strictEqual(resolveTargetTunnelName("native-one", { targetVessel: "awtsmoos-virtual-os" }), "awtsmoos-virtual-os");
let url = new URL(buildFsUrl("native-one", { action: "list" }));
assert.strictEqual(url.pathname, "/api/tunnel/control/fs/native-one");
assert.strictEqual(url.searchParams.get("targetVessel"), "native-one");
url = new URL(buildFsUrl("native-one", { action: "command", command: "pwd" }));
assert.strictEqual(url.pathname, "/api/tunnel/control/fs/native-one");
assert.strictEqual(url.searchParams.get("targetVessel"), "native-one");
assert(url.searchParams.get("command64"));
url = new URL(buildFsUrl("auto", { action: "list" }));
assert.strictEqual(url.pathname, "/api/tunnel/control/fs/auto");
assert.strictEqual(url.searchParams.get("targetVessel"), "auto");
url = new URL(buildFsUrl("auto", { action: "list", targetVessel: "native-local" }));
assert.strictEqual(url.pathname, "/api/tunnel/control/fs/auto");
assert.strictEqual(url.searchParams.get("targetVessel"), "native-local");
url = new URL(buildFsUrl("native-one", { action: "read", targetVessel: "awtsmoos-virtual-os", path: "alias/file.txt" }));
assert.strictEqual(url.pathname, "/api/tunnel/control/fs/awtsmoos-virtual-os");
assert.strictEqual(url.searchParams.get("targetVessel"), "awtsmoos-virtual-os");
assert.strictEqual(url.searchParams.get("p"), "alias/file.txt");
console.log("BHY target vessel routing tests passed");
