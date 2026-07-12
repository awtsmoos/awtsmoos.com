// B"H

import assert from "assert";

class FakeClassList {
	constructor() { this.items = new Set(); }
	add(...items) { items.filter(Boolean).forEach(item => this.items.add(item)); }
	remove(...items) { items.forEach(item => this.items.delete(item)); }
	contains(item) { return this.items.has(item); }
}

class FakeNode {
	constructor(tag = "div") {
		this.tag = tag;
		this.children = [];
		this.classList = new FakeClassList();
		this.attrs = {};
		this.dataset = {};
		this.textContent = "";
	}
	append(...children) { this.children.push(...children); }
	replaceChildren(...children) { this.children = children; }
	setAttribute(key, value) {
		this.attrs[key] = String(value);
		if (key.startsWith("data-")) this.dataset[key.slice(5).replace(/-./g, match => match[1].toUpperCase())] = String(value);
	}
	setAttributeNS(_namespace, key, value) { this.setAttribute(key, value); }
	addEventListener() {}
}

function walk(node) {
	return [node, ...(node.children || []).flatMap(child => typeof child === "object" ? walk(child) : [])];
}

global.Node = FakeNode;
global.document = {
	createElement: tag => new FakeNode(tag),
	createElementNS: (_namespace, tag) => new FakeNode(tag),
	createTextNode(text) { const node = new FakeNode("#text"); node.textContent = String(text); return node; },
	dispatchEvent() {}
};
global.localStorage = { getItem() { return null; }, setItem() {} };

const { createDashboard, dashboardHealthSummary, landingLinks } = await import("../dashboard.js");
const ctx = {
	session: { loggedIn: true },
	runtime: { id: "rt", mode: "native-tunnel", activeRoot: "/repo", tunnel: { connected: true, name: "native-one", allowWrite: true, allowCommands: true, raw: { tools: { fsRead: true, command: true, chrome: true } } } },
	getTunnelName: () => "native-one"
};
const summary = dashboardHealthSummary(ctx);
assert.strictEqual(summary.total, 8);
assert(summary.ready >= 5);
assert.strictEqual(landingLinks.os, "https://awtsmoos.com/os");
const dashboard = createDashboard(ctx);
assert.strictEqual(dashboard.tag, "section");
assert(!dashboard.children.some(child => child.classList?.items?.has("awt-health-panel")));
const text = walk(dashboard).map(child => child.textContent).join(" " );
assert(text.includes("Keep the agents working"));
assert(text.includes("Every agent, room, and action"));
assert(text.includes("Human steering"));
assert(text.includes("native-one"));
console.log("BHY dashboard live-agent tests passed");
