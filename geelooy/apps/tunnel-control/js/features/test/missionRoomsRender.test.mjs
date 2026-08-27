// B"H
import assert from "assert";

class FakeClassList { add() {} remove() {} toggle() {} }
class FakeNode {
  constructor(tag = "div") { this.tag = tag; this.children = []; this.dataset = {}; this.attrs = {}; this.classList = new FakeClassList(); this.textContent = ""; this.value = ""; this.style = {}; this.checked = false; this.hidden = false; }
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

/** B"H: Initial lobby may have lobby search/refresh, but no selected-room workspace/debug stream. */
const { missionRooms } = await import("../missionRooms.js");
const root = missionRooms();
function walk(node) { return [node, ...(node.children || []).flatMap(child => typeof child === "object" ? walk(child) : [])]; }
const nodes = walk(root);

for (const id of ["roomLobby", "roomStatus", "roomList", "roomWorkspace", "roomSearch", "roomFilter", "discoverRoomsBtn"]) {
  assert(nodes.some(node => node.id === id || node.attrs?.id === id), `${id} exists`);
}

const forbiddenSelectedRoomIds = ["roomCommandTable", "roomCommandsHeader", "roomProjectRoot", "roomPollMs", "refreshRoomBtn", "roomMessage", "sendRoomMessageBtn"];
for (const id of forbiddenSelectedRoomIds) {
  assert(!nodes.some(node => node.id === id || node.attrs?.id === id), `${id} is not in initial Mission Rooms lobby`);
}

const text = nodes.map(node => node.textContent || "").join("\n");
assert(!/Room tunnel calls|Tool Catalog|Live Calls|Command Stream/i.test(text), "initial lobby has no diagnostic labels");
assert(/Mission Control/i.test(text), "room OS title exists");
assert(nodes.some(node => String(node.className || "").includes("awt-room-lobby")), "room lobby exists");
console.log("BHY mission rooms room-OS render tests passed");
