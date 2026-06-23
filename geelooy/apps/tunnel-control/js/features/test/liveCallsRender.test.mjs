// B"H
import assert from "assert";

class FakeClassList { add() {} remove() {} }
class FakeNode {
  constructor(tag = "div") { this.tag = tag; this.children = []; this.dataset = {}; this.attrs = {}; this.classList = new FakeClassList(); this.textContent = ""; this.value = ""; this.style = {}; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(key, value) { this.attrs[key] = String(value); this[key] = String(value); }
  addEventListener() {}
}

global.Node = FakeNode;
global.window = { addEventListener() {} };
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
for (const id of ["liveGroupBy", "liveFilter", "liveLimit", "livePollMs", "liveGroups", "liveSummary", "liveViewport", "liveSpacer", "liveWindow", "liveOut"]) {
  assert(nodes.some(node => node.id === id || node.attrs?.id === id), `${id} exists`);
}
assert(nodes.some(node => String(node.className || "").includes("awt-live-layout")), "live layout exists");
assert(nodes.some(node => String(node.className || "").includes("awt-live-viewport")), "virtualized viewport exists");
console.log("BHY live calls render tests passed");
