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
	"websiteMaxSubagentDepth",
	"websiteMaxSubagents",
	"websiteMaxTotalAgents",
	"websiteSubagentSpacing",
	"websiteRecursiveSpawn",
	"websiteMessageTarget",
	"websiteMissionPrompt",
	"websiteMissionMessage"
]) {
  assert(nodes.some(node => node.id === id || node.attrs?.id === id), `${id} field exists`);
}
assert(nodes.some(node => node.dataset?.action === "missionAutopilot"), "missionAutopilot card exists");
assert(nodes.some(node => node.dataset?.action === "agent"), "canonical website mission start card exists");
assert(nodes.some(node => node.dataset?.search?.includes("Mission")), "mission cards are searchable");
const websiteCount = nodes.find(node => node.id === "websiteAgentCount" || node.attrs?.id === "websiteAgentCount");
assert.equal(websiteCount.value, "8");
assert.equal(websiteCount.min, "3");
assert.equal(websiteCount.max, "96");
const recursiveSpawn = nodes.find(node => node.id === "websiteRecursiveSpawn" || node.attrs?.id === "websiteRecursiveSpawn");
assert.equal(recursiveSpawn.checked, "true");
const totalAgents = nodes.find(node => node.id === "websiteMaxTotalAgents" || node.attrs?.id === "websiteMaxTotalAgents");
assert.equal(totalAgents.value, "256");
assert.equal(totalAgents.max, "512");
const recursiveDepth = nodes.find(node => node.id === "websiteMaxSubagentDepth" || node.attrs?.id === "websiteMaxSubagentDepth");
assert.equal(recursiveDepth.value, "4");
assert.equal(recursiveDepth.max, "8");
console.log("BHY usage mission action render tests passed");
