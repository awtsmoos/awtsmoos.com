// B"H
import assert from "assert";

class FakeClassList { constructor() { this.items = new Set(); } add(...x) { x.filter(Boolean).forEach(y => this.items.add(y)); } remove(...x) { x.forEach(y => this.items.delete(y)); } contains(x) { return this.items.has(x); } }
class FakeNode { constructor(tag = "div") { this.tag = tag; this.children = []; this.classList = new FakeClassList(); this.attrs = {}; this.dataset = {}; this.textContent = ""; this.value = ""; } append(...children) { this.children.push(...children); } replaceChildren(...children) { this.children = children; } setAttribute(k, v) { this.attrs[k] = String(v); this[k] = String(v); } addEventListener() {} }

global.Node = FakeNode;
global.location = { search: "" };
global.localStorage = { store: new Map(), setItem(k, v) { this.store.set(k, String(v)); }, getItem(k) { return this.store.get(k) || null; } };
global.document = { nodes: new Map(), createElement(tag) { return new FakeNode(tag); }, createTextNode(text) { const node = new FakeNode("#text"); node.textContent = String(text); return node; }, getElementById(id) { if (!this.nodes.has(id)) this.nodes.set(id, new FakeNode("div")); return this.nodes.get(id); } };
document.nodes.set("targetVesselSelect", new FakeNode("select"));

const { renderDeviceNice } = await import("../index.js");
const got = {
  ok: true,
  nativeDevices: [{
    tunnelId: "native-id",
    tunnelName: "native-one",
    deviceId: "native-device",
    vesselType: "native-tunnel",
    ownershipVerified: true,
    pairingProofVersion: 1,
    access: "owned",
    permissions: ["tunnel.read", "tunnel.write"],
    connected: true,
    isAlive: true,
    agentVersion: "1"
  }],
  browserDevices: [{
    tunnelId: "browser-id",
    tunnelName: "browser-one",
    deviceId: "browser-device",
    vesselType: "browser-tab",
    ownershipVerified: true,
    access: "owned",
    connected: true,
    isAlive: true
  }],
  virtualDevice: { tunnelName: "awtsmoos-virtual-os", vesselType: "virtual-os", allowWrite: true },
  recommended: { tunnelId: "browser-id", tunnelName: "browser-one" }
};
renderDeviceNice(got, null, () => "");

assert.strictEqual(document.getElementById("connectionText").textContent, "Verified connection");
assert.strictEqual(document.getElementById("miniAgent").textContent, "browser-one");
assert.strictEqual(document.getElementById("selectedTargetVessel").textContent, "browser-one");
const summary = document.getElementById("deviceSummary");
assert(summary.children.length >= 7);
const allText = collectText(summary).join("\n");
assert(allText.includes("Native tunnels: 1"));
assert(allText.includes("Browser sessions: 1"));
assert(allText.includes("Virtual OS: available"));
assert(allText.includes("Target vessel"));
assert(allText.includes("Verified vessel table"));

renderDeviceNice({ ok: true, virtualDevice: { tunnelName: "awtsmoos-virtual-os", vesselType: "virtual-os" }, recommended: { tunnelName: "awtsmoos-virtual-os", vesselType: "virtual-os" } }, null, () => "");
assert.strictEqual(document.getElementById("connectionText").textContent, "Virtual OS");
assert.strictEqual(document.getElementById("miniAgent").textContent, "awtsmoos-virtual-os");
console.log("BHY renderDeviceNice my-device tests passed");

function collectText(node) {
  return [
    node.textContent,
    ...(node.children || []).flatMap(collectText)
  ].filter(Boolean);
}
