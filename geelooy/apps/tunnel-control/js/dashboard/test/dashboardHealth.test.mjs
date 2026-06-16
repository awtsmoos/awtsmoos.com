// B"H
import assert from "assert";

class FakeClassList {
  constructor() { this.items = new Set(); }
  add(...items) { items.filter(Boolean).forEach(item => this.items.add(item)); }
  remove(...items) { items.forEach(item => this.items.delete(item)); }
  contains(item) { return this.items.has(item); }
  toggle(item, force) { const on = force === undefined ? !this.items.has(item) : !!force; if (on) this.items.add(item); else this.items.delete(item); return on; }
}
class FakeNode {
  constructor(tag = "div") { this.tag = tag; this.children = []; this.classList = new FakeClassList(); this.attrs = {}; this.dataset = {}; this.textContent = ""; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(key, value) { this.attrs[key] = String(value); this[key] = String(value); if (key.startsWith("data-")) this.dataset[key.slice(5).replace(/-./g, m => m[1].toUpperCase())] = String(value); }
  setAttributeNS(_ns, key, value) { this.setAttribute(key, value); }
  addEventListener() {}
  querySelectorAll(selector) { return walk(this).filter(node => selector === "[data-awt-filter]" ? node.dataset.awtFilter !== undefined : false); }
}

function walk(node) { return [node, ...(node.children || []).flatMap(child => typeof child === "object" ? walk(child) : [])]; }

global.Node = FakeNode;
global.document = {
  createElement(tag) { return new FakeNode(tag); },
  createElementNS(_ns, tag) { return new FakeNode(tag); },
  createTextNode(text) { const node = new FakeNode("#text"); node.textContent = String(text); return node; },
  dispatchEvent() {}
};
global.CustomEvent = class CustomEvent { constructor(type, init = {}) { this.type = type; this.detail = init.detail; } };
global.localStorage = { getItem() { return null; }, setItem() {} };

const { createDashboard, dashboardHealthSummary, landingLinks } = await import("../dashboard.js");
const ctx = {
  session: { loggedIn: true },
  runtime: { id: "rt", mode: "native-tunnel", activeRoot: "/repo", tunnel: { connected: true, name: "native-one", raw: { tools: { fsRead: true, command: true, chrome: true } } } },
  getTunnelName: () => "native-one",
  getProjectPath: () => "/repo"
};
const summary = dashboardHealthSummary(ctx);
assert.strictEqual(summary.total, 8);
assert(summary.ready >= 5);
assert.strictEqual(landingLinks.os, "https://awtsmoos.com/os");
const dashboard = createDashboard(ctx);
assert.strictEqual(dashboard.tag, "section");
assert(!dashboard.children.some(child => child.classList?.items?.has("awt-health-panel")), "landing does not render giant health panel");
const text = walk(dashboard).map(child => child.textContent).join(" ");
assert(text.includes("One control room. Three ways in."));
assert(text.includes("First time"));
assert(text.includes("Talk to Awtsmoos Shliach Agent"));
console.log("BHY dashboard landing tests passed");
