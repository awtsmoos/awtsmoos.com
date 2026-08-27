// B"H
import assert from "assert";

class FakeClassList { add() {} remove() {} }
class FakeNode {
  constructor(tag = "div") { this.tag = tag; this.children = []; this.dataset = {}; this.attrs = {}; this.classList = new FakeClassList(); this.textContent = ""; this.value = ""; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(key, value) { this.attrs[key] = String(value); this[key] = String(value); }
  addEventListener() {}
}

global.Node = FakeNode;
global.document = { createElement(tag) { return new FakeNode(tag); }, createTextNode(text) { const node = new FakeNode("#text"); node.textContent = String(text); return node; }, getElementById() { return null; } };

const { compute } = await import("../compute.js");
const root = compute();
function walk(node) { return [node, ...(node.children || []).flatMap(child => typeof child === "object" ? walk(child) : [])]; }
const nodes = walk(root);
assert(nodes.some(node => node.id === "computeBalance" || node.attrs?.id === "computeBalance"));
assert(nodes.some(node => node.id === "coinAmount" || node.attrs?.id === "coinAmount"));
assert(nodes.some(node => node.textContent === "Perutas, sandbox buys, and ancient coin math"));
console.log("BHY compute render tests passed");
