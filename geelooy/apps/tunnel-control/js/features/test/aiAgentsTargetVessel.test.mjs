// B"H
import assert from "assert";

const memory = new Map([["awtTargetVesselName", "awtsmoos-virtual-os"]]);
class FakeClassList { add() {} remove() {} }
class FakeNode { constructor(tag = "div") { this.tag = tag; this.children = []; this.dataset = {}; this.attrs = {}; this.classList = new FakeClassList(); this.textContent = ""; this.value = ""; } append(...children) { this.children.push(...children); } replaceChildren(...children) { this.children = children; } setAttribute(key, value) { this.attrs[key] = String(value); this[key] = String(value); } addEventListener() {} }

global.Node = FakeNode;
global.location = { search: "" };
global.localStorage = { getItem(key) { return memory.get(key) || null; }, setItem(key, value) { memory.set(key, String(value)); } };
global.document = { nodes: new Map(), createElement(tag) { return new FakeNode(tag); }, createTextNode(text) { const node = new FakeNode("#text"); node.textContent = String(text); return node; }, getElementById(id) { return this.nodes.get(id) || null; } };

const { aiAgents, resolveAiTarget } = await import("../aiAgents.js");
const root = aiAgents();
function walk(node) { return [node, ...(node.children || []).flatMap(child => typeof child === "object" ? walk(child) : [])]; }
const nodes = walk(root);
const targetSelect = nodes.find(node => node.id === "aiTargetVessel" || node.attrs?.id === "aiTargetVessel");
assert(targetSelect, "AI target vessel select exists");
document.nodes.set("aiTargetVessel", targetSelect);
targetSelect.value = "browser-one";
assert.strictEqual(resolveAiTarget(() => "native-one"), "awtsmoos-virtual-os");
memory.set("awtTargetVesselName", "browser-one");
assert.strictEqual(resolveAiTarget(() => "native-one"), "browser-one");
console.log("BHY aiAgents target vessel tests passed");
