// B"H
import assert from "node:assert/strict";

class FakeClassList {
	add() {}
	remove() {}
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
	}
	append(...children) { this.children.push(...children); }
	replaceChildren(...children) { this.children = children; }
	setAttribute(key, value) { this.attrs[key] = String(value); this[key] = String(value); }
	addEventListener() {}
}

globalThis.Node = FakeNode;
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
	chrome,
	chromeActionPayload,
	chromeResultValue
} = await import("../chrome.js");

const root = chrome();
const nodes = walk(root);
const engine = nodes.find(node => node.id === "chromeEngine" || node.attrs?.id === "chromeEngine");
assert(engine, "browser engine selector is visible");
assert.deepEqual(engine.children.map(option => option.value), ["chrome", "node-dom"]);

assert.deepEqual(chromeActionPayload("chromeNavigate", {
	engine: "node-dom",
	chromePath: "/Applications/Google Chrome.app",
	port: "9333",
	url: " https://example.test/path ",
	expression: "document.title"
}), {
	action: "chromeNavigate",
	engine: "node-dom",
	virtualDom: true,
	chromePath: undefined,
	port: 9333,
	url: "https://example.test/path",
	selector: "",
	text: "",
	expression: "document.title",
	script: []
});

const native = chromeActionPayload("chromeStatus", {
	engine: "chrome",
	chromePath: "/Applications/Google Chrome.app",
	port: 9222
});
assert.equal(native.virtualDom, false);
assert.equal(native.chromePath, "/Applications/Google Chrome.app");
assert.equal(chromeResultValue({ result: { result: { value: "Virtual Arrival" } } }), "Virtual Arrival");

function walk(node, output = []) {
	if (!node || typeof node !== "object") return output;
	output.push(node);
	for (const child of node.children || []) walk(child, output);
	return output;
}

console.log("BHY Tunnel Control native/virtual browser payload tests passed");
