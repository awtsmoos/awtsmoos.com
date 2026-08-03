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
	aiAgents,
	websiteMissionMessagePayload,
	websiteMissionStartPayload,
	websiteMissionStatusPayload
} = await import("../aiAgents.js");

const root = aiAgents();
const nodes = walk(root);
const ids = new Set(nodes.map(node => node.id || node.attrs?.id).filter(Boolean));

for (const id of [
	"websiteMissionPrompt",
	"websiteMissionAgentCount",
	"startWebsiteMissionBtn",
	"listWebsiteMissionsBtn",
	"websiteMissionId",
	"statusWebsiteMissionBtn",
	"resumeWebsiteMissionBtn",
	"websiteMissionAuth",
	"websiteMissionRoster",
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
	collaborationRounds: 20
}), {
	action: "agent",
	mode: "website-mission",
	prompt: "Build it",
	projectRoot: "/repo",
	agentCount: 3,
	scopes: ["apps/tunnel", "apps/tunnel-control"],
	startSpacingMs: 10000,
	collaborationRounds: 8
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

function walk(node, output = []) {
	if (!node || typeof node !== "object") return output;
	output.push(node);
	for (const child of node.children || []) walk(child, output);
	return output;
}

console.log("BHY authenticated website mission UI and payload tests passed");
