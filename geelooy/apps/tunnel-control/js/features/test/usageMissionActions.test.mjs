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
global.document = { createElement(tag) { return new FakeNode(tag); }, createTextNode(text) { const node = new FakeNode("#text"); node.textContent = String(text); return node; }, getElementById() { return null; }, querySelectorAll() { return []; } };

const { usage } = await import("../usage.js");
const { ACTION_CATALOG } = await import("../actionCatalogData.js");

const missionActions = [
	"missionStart",
	"missionAutopilot",
	"missionBrainstorm",
	"missionCheckpoint",
	"missionSelfMailDraft",
	"missionReport",
	"agent",
	"websiteAgentMissionList",
	"websiteAgentMissionStatus",
	"websiteAgentMissionMessage",
	"websiteAgentMissionStop",
	"websiteAgentMissionForget",
	"chatgptWebsiteLogout"
];
for (const name of missionActions) assert(ACTION_CATALOG.some(action => action.name === name), `${name} exists in action catalog`);

const root = usage();
function walk(node) { return [node, ...(node.children || []).flatMap(child => typeof child === "object" ? walk(child) : [])]; }
const nodes = walk(root);
for (const id of [
	"missionGoal",
	"missionId",
	"missionRounds",
	"selfEmail",
	"missionAnswer",
	"websiteMissionId",
	"websiteAgentCount",
	"websiteStartSpacing",
	"websiteMessageTarget",
	"websiteMissionPrompt",
	"websiteMissionMessage"
]) {
  assert(nodes.some(node => node.id === id || node.attrs?.id === id), `${id} field exists`);
}
assert(nodes.some(node => node.dataset?.action === "missionAutopilot"), "missionAutopilot card exists");
assert(nodes.some(node => node.dataset?.action === "agent"), "canonical website mission start card exists");
assert(nodes.some(node => node.dataset?.search?.includes("Mission")), "mission cards are searchable");
console.log("BHY usage mission action render tests passed");
