//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const { tokenizeHtml } = require("../../standards/html/HtmlTokenizer.js");
const { VirtualHtmlHydrator } = require("../../VirtualHtmlHydrator.js");

/**
 * Minimal executor-owned node used to validate parser/tree semantics without
 * borrowing DOM parsing behavior from Node, a browser, jsdom, or any library.
 */
class TestNode {
	constructor(localName, document, text = "") {
		this.attributes = Object.create(null);
		this.children = [];
		this.localName = localName;
		this.ownerDocument = document;
		this.parentNode = null;
		this.rawText = text;
		this.style = createStyle();
	}

	appendChild(child) {
		child.parentNode = this;
		this.children.push(child);
		return child;
	}

	replaceChildren() {
		this.children = [];
	}

	setAttribute(name, value) {
		this.attributes[name] = String(value);
		if (name === "id") this.id = String(value);
	}

	getAttribute(name) {
		return this.attributes[name] ?? null;
	}

	get textContent() {
		return this.localName === "#text"
			? this.rawText
			: this.children.map(child => child.textContent).join("");
	}
}

/** Creates only the document surface required by the standards tree builder. */
function createDocument() {
	const document = {};
	document.cssTexts = [];
	document.cssEngine = {
		compute() {
			return {};
		},
		parseStyleSheet(text) {
			document.cssTexts.push(text);
		}
	};
	document.documentElement = new TestNode("html", document);
	document.head = new TestNode("head", document);
	document.body = new TestNode("body", document);
	document.documentElement.appendChild(document.head);
	document.documentElement.appendChild(document.body);
	document.createElement = name => new TestNode(name, document);
	document.createTextNode = text => new TestNode("#text", document, text);
	document.querySelector = selector => findNode(document.documentElement, selector);
	return document;
}

/** Finds a simple tag or id in the deterministic test tree. */
function findNode(node, selector) {
	if (selector[0] === "#" && node.id === selector.slice(1)) return node;
	if (selector[0] !== "#" && node.localName === selector) return node;
	for (const child of node.children) {
		const found = findNode(child, selector);
		if (found) return found;
	}
	return null;
}

/** Provides the style API consumed by user-agent display defaults. */
function createStyle() {
	const values = Object.create(null);
	return {
		getPropertyValue(name) {
			return values[name] || "";
		},
		setProperty(name, value) {
			values[name] = String(value);
		}
	};
}

test("tokenizer preserves raw text, comments, attributes, and references", () => {
	const tokens = tokenizeHtml('<!doctype html><!--x--><div a="1 &amp; 2">A &amp; B<style>x<y{z:q}</style></div>');
	assert.equal(tokens[0].type, "doctype");
	assert.equal(tokens[1].data, "x");
	assert.equal(tokens[2].attributes[0].value, "1 & 2");
	assert.equal(tokens[3].data, "A & B");
	assert.equal(tokens[5].data, "x<y{z:q}");
});

test("hydrator builds canonical document tree without host HTML parsing", () => {
	const document = createDocument();
	const result = new VirtualHtmlHydrator().hydrate(document, '<title>A &amp; B</title><style>#x{color:red}</style><div id="x">שלום <b>World</b></div>');
	assert.equal(result.ok, true);
	assert.equal(result.title, "A & B");
	assert.equal(document.querySelector("#x").textContent, "שלום World");
	assert.deepEqual(document.cssTexts, ["#x{color:red}"]);
});
