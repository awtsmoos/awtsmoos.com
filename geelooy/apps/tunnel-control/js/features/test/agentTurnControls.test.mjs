// B"H

import assert from "assert";

class FakeClassList {
	constructor() { this.items = new Set(); }
	add(...items) { items.forEach(item => this.items.add(item)); }
	remove(...items) { items.forEach(item => this.items.delete(item)); }
}

class FakeNode {
	constructor(tag = "div") {
		this.tag = tag;
		this.children = [];
		this.dataset = {};
		this.attrs = {};
		this.classList = new FakeClassList();
		this.textContent = "";
		this.value = "";
		this.events = {};
	}
	append(...children) { this.children.push(...children); }
	replaceChildren(...children) { this.children = children; }
	setAttribute(key, value) { this.attrs[key] = String(value); this[key] = String(value); }
	addEventListener(key, value) { this.events[key] = value; }
}

const roots = new Map();
global.Node = FakeNode;
global.document = {
	createElement: tag => new FakeNode(tag),
	createTextNode(text) { const node = new FakeNode("#text"); node.textContent = String(text); return node; },
	getElementById: id => roots.get(id) || null
};

const root = new FakeNode("section");
roots.set("roomAgentControls", root);
const { renderAgentControls } = await import("../agentControls/render.js");
const calls = [];
const state = {
	selectedMissionId: "mission-one",
	turnBusy: false,
	continuation: {
		revision: 4,
		preset: "deep",
		desiredState: "paused",
		observedState: "paused",
		maxTurns: 100,
		maxRuntimeMinutes: 480,
		maxConsecutiveErrors: 5,
		intervalMs: 2500,
		updateCadence: "milestones",
		pauseMode: "after-action",
		startedTurns: 20,
		completedTurns: 19,
		consecutiveErrors: 0,
		oneTurnCredits: 0
	},
	continuationPresets: { deep: { label: "Deep work", maxTurns: 100, maxRuntimeMinutes: 480 } },
	resourceStatus: { scheduler: { timerActive: true, inFlight: false }, transactions: { keys: 1 } }
};
const handlers = Object.fromEntries(["preset", "save", "pause", "resume", "once", "refresh", "drain", "stop"].map(name => [name, value => calls.push([name, value])]));
renderAgentControls(state, { ...handlers, busy: false });

function walk(node) {
	return [node, ...(node.children || []).flatMap(child => typeof child === "object" ? walk(child) : [])];
}

const nodes = walk(root);
const text = nodes.map(node => node.textContent || "").join(" ");
for (const phrase of ["Calm autonomy", "Run one turn", "Leak and lifecycle evidence", "Stop and clean"]) {
	assert(text.includes(phrase), `missing ${phrase}`);
}
for (const id of ["turnPreset", "turnMaxTurns", "turnRuntimeMinutes", "turnMaxErrors", "turnIntervalMs", "turnCadence", "turnPauseMode"]) {
	assert(nodes.some(node => node.id === id || node.attrs?.id === id), `${id} exists`);
}
const pause = nodes.find(node => node.textContent === "Pause");
pause.events.click();
assert.equal(calls[0][0], "pause");
assert(String(root.className).includes("is-paused"));
console.log("BHY agent turn controls DOM test passed");
