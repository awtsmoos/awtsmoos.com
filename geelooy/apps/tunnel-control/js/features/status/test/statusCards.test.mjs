// B"H
import assert from "assert";

class FakeClassList {
  constructor() { this.items = new Set(); }
  add(...items) { items.filter(Boolean).forEach(item => this.items.add(item)); }
  remove(...items) { items.forEach(item => this.items.delete(item)); }
  contains(item) { return this.items.has(item); }
}

class FakeNode {
  constructor(tag = "div") { this.tag = tag; this.children = []; this.classList = new FakeClassList(); this.attrs = {}; this.textContent = ""; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(key, value) { this.attrs[key] = String(value); }
}

global.Node = FakeNode;
global.document = {
  nodes: new Map(),
  createElement(tag) { return new FakeNode(tag); },
  createTextNode(text) { const node = new FakeNode("#text"); node.textContent = String(text); return node; },
  getElementById(id) { if (!this.nodes.has(id)) this.nodes.set(id, new FakeNode("div")); return this.nodes.get(id); }
};

const cards = await import("../summaryCards.js");
const identity = cards.renderIdentityNice({ ok: true, identity: { userId: "test-user", kind: "oauth" } });
assert(collectText(identity).includes("Logged in as test-user"));
assert.strictEqual(document.getElementById("miniLogin").textContent, "test-user");

const family = cards.vesselFamiliesCard({
  nativeDevices: [{ tunnelName: "native-one", vesselType: "native-tunnel" }],
  browserDevices: [{ tunnelName: "browser-one", vesselType: "browser-tab" }],
  virtualDevice: { tunnelName: "awtsmoos-virtual-os", vesselType: "virtual-os" },
  recommended: { tunnelName: "browser-one" }
});
const text = collectText(family).join("\n");
assert(text.includes("Native tunnels: 1"));
assert(text.includes("Browser sessions: 1"));
assert(text.includes("Virtual OS: available"));
assert(text.includes("Recommended: browser-one"));

const list = cards.deviceListCard("Browser-tab tunnels", [{ tunnelName: "browser-one", vesselType: "browser-tab" }]);
assert(collectText(list).includes("Browser-tab tunnels"));
assert(collectText(list).join(" ").includes("browser-one"));

console.log("BHY tunnel-control status card tests passed");

function collectText(node) {
  return [
    node.textContent,
    ...(node.children || []).flatMap(collectText)
  ].filter(Boolean);
}
