// B"H
import assert from "assert";

class FakeClassList { constructor() { this.items = new Set(); } add(...x) { x.filter(Boolean).forEach(y => this.items.add(y)); } remove(...x) { x.forEach(y => this.items.delete(y)); } }
class FakeNode {
  constructor(tag = "div") { this.tag = tag; this.children = []; this.attrs = {}; this.dataset = {}; this.style = {}; this.textContent = ""; this.value = ""; this.classList = new FakeClassList(); }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(k, v) { this.attrs[k] = String(v); this[k] = String(v); }
  addEventListener() {}
}

global.Node = FakeNode;
global.location = { search: "" };
global.localStorage = { getItem() { return null; }, setItem() {} };
global.document = {
  createElement(tag) { return new FakeNode(tag); },
  createTextNode(text) { const n = new FakeNode("#text"); n.textContent = String(text); return n; },
  getElementById() { return null; }
};

const { aiAgents, AI_PROVIDER_OPTIONS } = await import("../aiAgents.js");
const root = aiAgents();
assert.strictEqual(root.tag, "section");
assert.strictEqual(root.dataset.pane, "aiAgents");
assert(AI_PROVIDER_OPTIONS.some(x => x.value === "deepseek"));

function walk(node, out = []) {
  if (!node || typeof node !== "object") return out;
  out.push(node);
  for (const child of node.children || []) walk(child, out);
  return out;
}

const nodes = walk(root);
const selects = nodes.filter(n => n.tag === "select");
const providerSelect = selects.find(select => select.id === "aiProviderId" || select.attrs.id === "aiProviderId");
assert(providerSelect, "provider select exists");
const optionValues = providerSelect.children.map(option => option.value ?? option.attrs.value);
const optionText = providerSelect.children.map(option => option.textContent);
assert.deepStrictEqual(optionValues, ["openrouter", "minimax", "deepseek", "groq"]);
assert(optionText.includes("DeepSeek"));

console.log("BHY aiAgents render provider tests passed");
