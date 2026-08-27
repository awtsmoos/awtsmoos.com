// B"H
import assert from "assert";

class FakeClassList { constructor() { this.items = new Set(); } add(...items) { items.filter(Boolean).forEach(item => this.items.add(item)); } }
class FakeNode { constructor(tag = "div") { this.tag = tag; this.children = []; this.classList = new FakeClassList(); this.attrs = {}; this.textContent = ""; } append(...children) { this.children.push(...children); } setAttribute(key, value) { this.attrs[key] = String(value); this[key] = String(value); } }

global.Node = FakeNode;
global.document = { createElement(tag) { return new FakeNode(tag); }, createTextNode(text) { const node = new FakeNode("#text"); node.textContent = String(text); return node; } };

const { buildHealthMatrix, summarizeHealth, createHealthMatrix } = await import("../matrix.js");
const ctx = {
  session: { loggedIn: true },
  runtime: { mode: "native-tunnel", id: "runtime-one", activeRoot: "/repo", tunnel: { connected: true, name: "native-one", raw: { tools: { fsRead: true, command: true, chrome: true }, command: { enabled: true }, chrome: { enabled: true } } } },
  devices: { browserDevices: [{ tunnelName: "browser-one", vesselType: "browser-tab" }], virtualDevice: { tunnelName: "awtsmoos-virtual-os", vesselType: "virtual-os" } },
  providers: [{ id: "deepseek" }]
};
const checks = buildHealthMatrix(ctx);
assert.strictEqual(checks.length, 8);
assert.strictEqual(checks.find(check => check.key === "auth").tone, "good");
assert.strictEqual(checks.find(check => check.key === "browser").tone, "good");
assert.strictEqual(checks.find(check => check.key === "ai").tone, "good");
assert.strictEqual(summarizeHealth(checks).ready, 8);
const panel = createHealthMatrix(ctx);
assert.strictEqual(panel.tag, "section");
assert(panel.children[1].children.length === 8);
const blocked = buildHealthMatrix({ session: { loggedIn: false }, devices: { virtualDevice: null } });
assert.strictEqual(blocked.find(check => check.key === "auth").tone, "bad");
console.log("BHY health matrix tests passed");
