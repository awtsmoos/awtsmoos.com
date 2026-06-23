// B"H
import assert from "assert";

class FakeClassList { add() {} remove() {} }
class FakeNode {
  constructor(tag = "div") { this.tag = tag; this.children = []; this.dataset = {}; this.attrs = {}; this.classList = new FakeClassList(); this.textContent = ""; this.value = ""; this.style = {}; this.checked = false; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(key, value) { this.attrs[key] = String(value); this[key] = String(value); }
  addEventListener() {}
}

global.Node = FakeNode;
global.window = { addEventListener() {} };
global.location = { origin: "http://127.0.0.1", search: "" };
Object.defineProperty(globalThis, "navigator", { value: { clipboard: { writeText: async () => true } }, configurable: true });
global.document = {
  createElement(tag) { return new FakeNode(tag); },
  createTextNode(text) { const node = new FakeNode("#text"); node.textContent = String(text); return node; },
  getElementById() { return null; },
  querySelectorAll() { return []; }
};

const { missionRooms } = await import("../missionRooms.js");
const root = missionRooms();
function walk(node) { return [node, ...(node.children || []).flatMap(child => typeof child === "object" ? walk(child) : [])]; }
const nodes = walk(root);
for (const id of ["roomProjectRoot", "roomAgentId", "roomPollMs", "discoverRoomsBtn", "refreshRoomBtn", "copyRoomLinkBtn", "roomStatus", "roomList", "roomHeader", "roomMessages", "roomMessage", "roomBlockAgents", "sendRoomMessageBtn", "allowRoomContinueBtn", "roomOut"]) {
  assert(nodes.some(node => node.id === id || node.attrs?.id === id), `${id} exists`);
}
assert(nodes.some(node => String(node.className || "").includes("awt-room-layout")), "room layout exists");
assert(nodes.some(node => String(node.className || "").includes("awt-room-messages")), "room messages list exists");
console.log("BHY mission rooms render tests passed");
