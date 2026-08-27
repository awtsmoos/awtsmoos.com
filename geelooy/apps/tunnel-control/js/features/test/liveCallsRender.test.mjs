// B"H
import assert from "assert";

class FakeClassList { add() {} remove() {} toggle() {} }
class FakeNode {
  constructor(tag = "div") { this.tag = tag; this.children = []; this.dataset = {}; this.attrs = {}; this.classList = new FakeClassList(); this.textContent = ""; this.value = ""; this.style = {}; this.hidden = false; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(key, value) { this.attrs[key] = String(value); this[key] = String(value); }
  addEventListener() {}
}

global.Node = FakeNode;
global.window = { addEventListener() {} };
global.location = { origin: "http://127.0.0.1", search: "" };
global.document = {
  createElement(tag) { return new FakeNode(tag); },
  createTextNode(text) { const node = new FakeNode("#text"); node.textContent = String(text); return node; },
  getElementById() { return null; },
  querySelectorAll() { return []; }
};

const { live } = await import("../live.js");
const root = live();
function walk(node) { return [node, ...(node.children || []).flatMap(child => typeof child === "object" ? walk(child) : [])]; }
const nodes = walk(root);
for (const id of ["liveGroupBy", "liveFilter", "liveLimit", "livePollMs", "startLiveBtn", "stopLiveBtn", "refreshLiveBtn", "clearLiveBtn", "liveSocketState", "liveGroups", "liveSummary", "liveWindow", "liveOut"]) {
  assert(nodes.some(node => node.id === id || node.attrs?.id === id), `${id} exists`);
}
for (const id of ["mode", "total", "ok", "failed", "visible", "updated"]) {
  assert(nodes.some(node => node.id === `liveKpi_${id}` || node.attrs?.id === `liveKpi_${id}`), `liveKpi_${id} exists`);
}
const text = nodes.map(node => node.textContent || "").join("\n");
assert(/WebSocket-first/i.test(text), "websocket-first copy exists");
assert(nodes.some(node => String(node.className || "").includes("awt-live-shell")), "cockpit shell exists");
assert(nodes.some(node => String(node.className || "").includes("awt-live-inspector")), "inspector exists");
console.log("BHY live actions websocket-first render tests passed");
