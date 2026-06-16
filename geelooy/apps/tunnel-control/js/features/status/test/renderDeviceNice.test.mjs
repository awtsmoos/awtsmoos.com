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
  nativeDevices: [{ tunnelName: "native-one", vesselType: "native-tunnel", root: "/repo", allowWrite: true, agentVersion: "1" }],
  browserDevices: [{ tunnelName: "browser-one", vesselType: "browser-tab", allowWrite: true }],
  virtualDevice: { tunnelName: "awtsmoos-virtual-os", vesselType: "virtual-os", allowWrite: true },
  recommended: { tunnelName: "browser-one", vesselType: "browser-tab", allowWrite: true, agentVersion: "tab-1" }
};
renderDeviceNice(got, null, () => "");

assert.strictEqual(document.getElementById("connectionText").textContent, "Connected");
assert.strictEqual(document.getElementById("miniAgent").textContent, "browser-one");
assert.strictEqual(document.getElementById("selectedTargetVessel").textContent, "browser-one");
const summary = document.getElementById("deviceSummary");
assert(summary.children.length >= 7);
const allText = summary.children.flatMap(card => card.children.map(x => x.textContent)).join("\n");
assert(allText.includes("Native tunnels: 1"));
assert(allText.includes("Browser tabs: 1"));
assert(allText.includes("Virtual OS: available"));
assert(allText.includes("Target vessel"));
assert(allText.includes("Active tunnel/vessel table"));

renderDeviceNice({ ok: true, virtualDevice: { tunnelName: "awtsmoos-virtual-os", vesselType: "virtual-os" }, recommended: { tunnelName: "awtsmoos-virtual-os", vesselType: "virtual-os" } }, null, () => "");
assert.strictEqual(document.getElementById("connectionText").textContent, "Virtual OS");
assert.strictEqual(document.getElementById("miniAgent").textContent, "awtsmoos-virtual-os");
console.log("BHY renderDeviceNice my-device tests passed");
