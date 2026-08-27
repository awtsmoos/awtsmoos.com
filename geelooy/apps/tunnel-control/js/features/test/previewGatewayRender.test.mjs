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
global.btoa = value => Buffer.from(String(value), "binary").toString("base64");
global.unescape = value => value;

global.encodeURIComponent = encodeURIComponent;
const { previewGateway } = await import("../previewGateway.js");
const root = previewGateway();
function walk(node) { return [node, ...(node.children || []).flatMap(child => typeof child === "object" ? walk(child) : [])]; }
const nodes = walk(root);
assert(nodes.some(node => node.id === "createPreviewBtn" || node.attrs?.id === "createPreviewBtn"));
assert(nodes.some(node => node.id === "allowAiCreatePublic" || node.attrs?.id === "allowAiCreatePublic"));
assert(nodes.some(node => node.id === "conversationName" || node.attrs?.id === "conversationName"));
assert(nodes.some(node => node.id === "previewFrame" || node.attrs?.id === "previewFrame"));
assert(nodes.some(node => node.textContent === "Private live previews from any vessel"));
console.log("BHY preview gateway render tests passed");
