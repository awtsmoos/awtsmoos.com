// B"H
import assert from "node:assert/strict";

class FakeClassList {
	constructor() { this.items = new Set(); }
	add(...items) { items.filter(Boolean).forEach(item => this.items.add(item)); }
	remove(...items) { items.forEach(item => this.items.delete(item)); }
}

class FakeNode {
	constructor(tag = "div") {
		this.tag = tag;
		this.children = [];
		this.attrs = {};
		this.dataset = {};
		this.textContent = "";
		this.value = "";
		this.classList = new FakeClassList();
	}
	append(...children) { this.children.push(...children); }
	replaceChildren(...children) { this.children = children; }
	setAttribute(key, value) { this.attrs[key] = String(value); this[key] = String(value); }
	addEventListener() {}
}

globalThis.Node = FakeNode;
globalThis.location = { search: "", href: "https://awtsmoos.com/apps/tunnel-control/" };
globalThis.localStorage = { getItem() { return null; }, setItem() {} };
globalThis.document = {
	createElement(tag) { return new FakeNode(tag); },
	createTextNode(text) {
		const node = new FakeNode("#text");
		node.textContent = String(text);
		return node;
	},
	getElementById() { return null; }
};

const {
	AWTSMOOS_SHLIACH_NAME,
	AWTSMOOS_SHLIACH_URL,
	aiAgents,
	normalizeCustomGptUrl,
	preferredWebsiteMission,
	websiteMissionMessagePayload,
	websiteMissionProgressEntries,
	websiteMissionPolicySummary,
	websiteMissionRosterEntries,
	websiteMissionStartPayload,
	websiteMissionStatusPayload
} = await import("../aiAgents.js");

const root = aiAgents();
const nodes = walk(root);
const ids = new Set(nodes.map(node => node.id || node.attrs?.id).filter(Boolean));
const targetSummary = nodes.find(node => node.id === "websiteMissionTargetSummary");
const targetInput = nodes.find(node => node.id === "websiteMissionAgentStartUrl");
assert.match(targetSummary.textContent, /Awtsmoos Shliach/);
assert.equal(targetInput.value, AWTSMOOS_SHLIACH_URL);

for (const id of [
	"websiteMissionPrompt",
	"websiteMissionAgentCount",
	"websiteMissionTargetSummary",
	"websiteMissionCustomGptName",
	"websiteMissionAgentStartUrl",
	"websiteMissionMaxSubagents",
	"websiteMissionMaxSubagentDepth",
	"websiteMissionMaxTotalAgents",
	"websiteMissionSubagentSpacing",
	"websiteMissionAllowRecursive",
	"startWebsiteMissionBtn",
	"listWebsiteMissionsBtn",
	"websiteMissionId",
	"statusWebsiteMissionBtn",
	"resumeWebsiteMissionBtn",
	"websiteMissionAuth",
	"websiteMissionRoster",
	"websiteMissionProgress",
	"websiteMissionMessage",
	"messageWebsiteMissionBtn",
	"stopWebsiteMissionBtn",
	"forgetWebsiteMissionBtn",
	"logoutChatgptWebsiteBtn"
]) {
	assert(ids.has(id), `${id} is rendered`);
}

assert.deepEqual(websiteMissionStartPayload({
	prompt: "  Build it  ",
	projectRoot: " /repo ",
	agentCount: 1,
	scopes: "apps/tunnel\napps/tunnel-control",
	startSpacingMs: 500,
	collaborationRounds: 20,
	customGptName: "  Awtsmoos Shliach  ",
	agentStartUrl: `${AWTSMOOS_SHLIACH_URL}/c/private?temporary=yes#fragment`,
	allowRecursiveSubagents: true,
	maxSubagentDepth: 99,
	maxSubagentsPerAgent: 99,
	maxTotalWebsiteAgents: 999,
	subagentStartSpacingMs: 500
}), {
	action: "agent",
	mode: "website-mission",
	prompt: "Build it",
	projectRoot: "/repo",
	agentCount: 3,
	scopes: ["apps/tunnel", "apps/tunnel-control"],
	startSpacingMs: 10000,
	collaborationRounds: 8,
	customGptName: AWTSMOOS_SHLIACH_NAME,
	agentStartUrl: AWTSMOOS_SHLIACH_URL,
	allowRecursiveSubagents: true,
	maxSubagentDepth: 8,
	maxSubagentsPerAgent: 96,
	maxTotalWebsiteAgents: 512,
	subagentStartSpacingMs: 10000
});

const defaults = websiteMissionStartPayload({ prompt: "Focused work" });
assert.equal(defaults.agentCount, 8);
assert.equal(defaults.maxSubagentsPerAgent, 32);
assert.equal(defaults.maxSubagentDepth, 4);
assert.equal(defaults.maxTotalWebsiteAgents, 256);
assert.equal(defaults.subagentStartSpacingMs, 12000);
assert.equal(defaults.allowRecursiveSubagents, true);
assert.equal(defaults.agentStartUrl, AWTSMOOS_SHLIACH_URL);
assert.equal(defaults.customGptName, AWTSMOOS_SHLIACH_NAME);
assert.equal(websiteMissionStartPayload({ agentCount: 999 }).agentCount, 96);
assert.equal(websiteMissionStartPayload({ agentCount: 1 }).agentCount, 3);
assert.equal(
	normalizeCustomGptUrl(`${AWTSMOOS_SHLIACH_URL}/c/private?x=1`),
	AWTSMOOS_SHLIACH_URL
);
assert.throws(
	() => normalizeCustomGptUrl("https://chatgpt.com/g/g-example"),
	/invalid_chatgpt_custom_gpt_url/
);
assert.throws(
	() => normalizeCustomGptUrl("https://example.com/g/not-chatgpt"),
	/invalid_chatgpt_custom_gpt_url/
);

assert.deepEqual(websiteMissionProgressEntries([
	{ at: "1", type: "one", agentId: "a" },
	{ at: "2", type: "agent_progress", agentId: "b", stage: "website-submit", status: "accepted" }
]), [
	{ at: "2", label: "b", detail: "agent_progress · website-submit · accepted" },
	{ at: "1", label: "a", detail: "one" }
]);

const largeRoster = websiteMissionRosterEntries(Array.from({ length: 600 }, (_, index) => ({
	id: `agent_${index}`,
	name: `Agent ${index}`,
	parentAgentId: index ? `agent_${Math.floor((index - 1) / 3)}` : "",
	depth: Math.min(6, Math.floor(index / 12)),
	spawnedChildCount: index < 32 ? 3 : 0,
	childAgentIds: index < 32
		? [`agent_${index * 3 + 1}`, `agent_${index * 3 + 2}`, `agent_${index * 3 + 3}`]
		: [],
	spawnPrompt: "Inspect this bounded scope and publish PLAN, PROGRESS, HANDOFF, and COMPLETION. ".repeat(40),
	lastUpdate: "x".repeat(5000),
	lastOutcome: {
		files: Array.from({ length: 50 }, (_unused, file) => `file-${file}`),
		continuationKey: "must-never-render"
	}
})));
assert.equal(largeRoster.length, 512);
assert.equal(largeRoster[0].lastUpdate.length, 1200);
assert.equal(largeRoster[0].lastOutcome.files.length, 20);
assert.equal(Object.hasOwn(largeRoster[0].lastOutcome, "continuationKey"), false);
assert.equal(largeRoster[0].depth, 0);
assert.equal(largeRoster[0].spawnedChildCount, 3);
assert.equal(largeRoster[1].parentAgentId, "agent_0");
assert.match(largeRoster[12].displayName, /^↳ /);
assert.equal(largeRoster[12].spawnPrompt.length, 1200);

assert.deepEqual(websiteMissionPolicySummary({ subagentPolicy: {
	allowRecursiveSubagents: true,
	maxSubagentDepth: 5,
	maxSubagentsPerAgent: 9,
	maxTotalWebsiteAgents: 80,
	subagentStartSpacingMs: 15000
} }), {
	allowRecursiveSubagents: true,
	maxSubagentDepth: 5,
	maxSubagentsPerAgent: 9,
	maxTotalWebsiteAgents: 80,
	subagentStartSpacingMs: 15000,
	compact: "recursive ≤5 deep / ≤80 total",
	long: "recursive delegation on; depth ≤5, children per parent ≤9, global agents ≤80, child starts spaced ≥15000 ms"
});

assert.deepEqual(websiteMissionStatusPayload(" web_1 ", true), {
	action: "websiteAgentMissionStatus",
	websiteMissionId: "web_1",
	refreshAuthentication: true
});

assert.deepEqual(websiteMissionMessagePayload({
	websiteMissionId: " web_1 ",
	toAgent: " website_03_browser ",
	body: " Continue and report. "
}), {
	action: "websiteAgentMissionMessage",
	websiteMissionId: "web_1",
	toAgent: "website_03_browser",
	body: "Continue and report."
});

const missions = [
	{ id: "web_new", missionId: "mission_new", agents: [{ id: "agent_1" }] },
	{ id: "web_old", missionId: "mission_old", agents: [{ id: "agent_2" }] }
];
assert.equal(preferredWebsiteMission(missions, "web_old").id, "web_old");
assert.equal(preferredWebsiteMission(missions, "").id, "web_new");
assert.equal(preferredWebsiteMission([], "web_old"), null);

function walk(node, output = []) {
	if (!node || typeof node !== "object") return output;
	output.push(node);
	for (const child of node.children || []) walk(child, output);
	return output;
}

console.log("BHY authenticated website mission UI and payload tests passed");
