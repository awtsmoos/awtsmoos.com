// B"H
import assert from "assert";

const memory = new Map([["awtTargetVesselName", "browser-one"]]);
global.location = { origin: "https://awtsmoos.test" };
global.localStorage = { getItem(key) { return memory.get(key) || null; }, setItem(key, value) { memory.set(key, String(value)); } };

const { buildFsUrl, resolveTargetTunnelName } = await import("../tunnel.js");
assert.strictEqual(resolveTargetTunnelName("native-one", {}), "browser-one");
assert.strictEqual(resolveTargetTunnelName("native-one", { targetVessel: "awtsmoos-virtual-os" }), "awtsmoos-virtual-os");
let url = new URL(buildFsUrl("native-one", { action: "list" }));
assert.strictEqual(url.pathname, "/api/tunnel/control/fs/browser-one");
assert.strictEqual(url.searchParams.get("targetVessel"), "browser-one");
url = new URL(buildFsUrl("native-one", { action: "read", targetVessel: "awtsmoos-virtual-os", path: "alias/file.txt" }));
assert.strictEqual(url.pathname, "/api/tunnel/control/fs/awtsmoos-virtual-os");
assert.strictEqual(url.searchParams.get("p"), "alias/file.txt");
console.log("BHY target vessel routing tests passed");
