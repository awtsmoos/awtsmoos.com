// B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

/**
 * Proves the pure DOM readers (extract.js) return what the agent needs:
 * raw HTML in chunks, the parsed DOM tree, a compact summary, and every
 * clickable element with a selector that actually selects it. The readers
 * run against a small fake DOM here (no jsdom in this repo) that supports
 * exactly the selectors the readers use — tag, #id, .class, [attr],
 * [attr="value"], comma lists, the " > " combinator and :nth-of-type —
 * so a selector is proven stable by running it through querySelector and
 * getting the same element back. The readers never mutate: the test also
 * proves the fake page is unchanged after every read.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(HERE, "..", "src");
const EXTRACT = fs.readFileSync(path.join(SRC, "extract.js"), "utf8");

// ---------- a minimal fake DOM ----------
// Supports: tag, #id, .class, [attr], [attr="value"], tag[attr],
// tag.class, comma lists, " > ", :nth-of-type(n). Enough for the readers
// and for verifying every stable selector they produce.

function parseSimple(simple) {
	const out = { tag: null, id: null, classes: [], attrs: [], nth: null };
	let rest = simple.trim();
	const tagMatch = rest.match(/^([a-zA-Z][a-zA-Z0-9]*|\*)/);
	if (tagMatch) {
		out.tag = tagMatch[1].toLowerCase();
		rest = rest.slice(tagMatch[0].length);
	}
	const nthMatch = rest.match(/:nth-of-type\((\d+)\)/);
	if (nthMatch) {
		out.nth = parseInt(nthMatch[1], 10);
		rest = rest.replace(nthMatch[0], "");
	}
	const idMatch = rest.match(/#([A-Za-z0-9_-]+)/);
	if (idMatch) out.id = idMatch[1];
	for (const m of rest.matchAll(/\.([A-Za-z0-9_-]+)/g)) out.classes.push(m[1]);
	for (const m of rest.matchAll(/\[([A-Za-z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\]]+)))?\]/g)) {
		out.attrs.push({ name: m[1], value: m[2] ?? m[3] ?? m[4] ?? null });
	}
	return out;
}

function matchesSimple(el, simple) {
	if (!el || el.nodeType !== 1) return false;
	const p = parseSimple(simple);
	if (p.tag && p.tag !== "*" && el.tagName.toLowerCase() !== p.tag) return false;
	if (p.id && el.getAttribute("id") !== p.id) return false;
	for (const c of p.classes) {
		const classes = (el.getAttribute("class") || "").split(/\s+/).filter(Boolean);
		if (!classes.includes(c)) return false;
	}
	for (const a of p.attrs) {
		const v = el.getAttribute(a.name);
		if (v === null || v === undefined) return false;
		if (a.value !== null && String(v) !== a.value) return false;
	}
	if (p.nth !== null) {
		if (!el.parentElement) return false;
		const same = el.parentElement.children.filter((s) => s.tagName === el.tagName);
		if (same.indexOf(el) + 1 !== p.nth) return false;
	}
	return true;
}

function matchesChain(el, chain) {
	// chain: ["html", "body", "div:nth-of-type(1)", ...] — left to right.
	let current = el;
	for (let i = chain.length - 1; i >= 0; i--) {
		if (!current || !matchesSimple(current, chain[i])) return false;
		current = current.parentElement;
	}
	return true;
}

function queryAllFrom(root, selector) {
	const results = [];
	const groups = selector.split(",").map((g) => g.trim()).filter(Boolean);
	const seen = new Set();
	function walk(el) {
		for (const group of groups) {
			const chain = group.split(/\s*>\s*/).map((s) => s.trim()).filter(Boolean);
			if (matchesChain(el, chain) && !seen.has(el)) {
				seen.add(el);
				results.push(el);
			}
		}
		for (const child of el.children) walk(child);
	}
	walk(root);
	return results;
}

class FakeText {
	constructor(text) {
		this.nodeType = 3;
		this.textContent = text;
	}
	get outerHTML() { return this.textContent; }
}

class FakeElement {
	constructor(tag, attrs = {}, children = [], rect = { width: 100, height: 20 }) {
		this.nodeType = 1;
		this.tagName = tag.toUpperCase();
		this._attrs = { ...attrs };
		this.children = [];
		this.childNodes = [];
		this.parentElement = null;
		this._rect = rect;
		for (const child of children) this.append(child);
	}
	append(child) {
		if (typeof child === "string") {
			this.childNodes.push(new FakeText(child));
			return this;
		}
		child.parentElement = this;
		this.children.push(child);
		this.childNodes.push(child);
		return this;
	}
	getAttribute(name) {
		const v = this._attrs[name];
		return v === undefined ? null : String(v);
	}
	get id() { return this._attrs.id || ""; }
	get className() { return this._attrs.class || ""; }
	get lang() { return this._attrs.lang || ""; }
	get href() { return this._attrs.href || ""; }
	get outerHTML() {
		const attrs = Object.entries(this._attrs).map(([k, v]) => ` ${k}="${v}"`).join("");
		const tag = this.tagName.toLowerCase();
		const voids = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"];
		if (voids.includes(tag)) return `<${tag}${attrs}>`;
		let inner = "";
		for (const n of this.childNodes) inner += n.outerHTML !== undefined ? n.outerHTML : (n.textContent || "");
		return `<${tag}${attrs}>${inner}</${tag}>`;
	}
	get value() { return this._attrs.value !== undefined ? String(this._attrs.value) : ""; }
	get type() { return this._attrs.type || ""; }
	get name() { return this._attrs.name || ""; }
	get placeholder() { return this._attrs.placeholder || ""; }
	get action() { return this._attrs.action || ""; }
	get disabled() { return this._attrs.disabled === true || this._attrs.disabled === ""; }
	get textContent() {
		let out = "";
		for (const n of this.childNodes) out += n.textContent || "";
		return out;
	}
	get innerText() { return this.textContent; }
	getBoundingClientRect() { return { ...this._rect, top: 0, left: 0 }; }
	querySelectorAll(selector) { return queryAllFrom(this, selector); }
	querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}

function buildPage() {
	const hidden = new FakeElement("span", { class: "hidden" }, ["Hidden text"], { width: 0, height: 0 });
	const page = new FakeElement("html", { lang: "en" }, [
		new FakeElement("head", {}, [
			new FakeElement("title", {}, ["Test Page Title"]),
			new FakeElement("meta", { name: "description", content: "A test page for the Shliach readers." }),
		]),
		new FakeElement("body", {}, [
			new FakeElement("h1", {}, ["Main Heading"]),
			new FakeElement("h2", {}, ["Section One"]),
			new FakeElement("p", {}, ["First paragraph with some words."]),
			new FakeElement("a", { href: "/foo", id: "link-foo" }, ["Go to foo"]),
			new FakeElement("button", { class: "primary big", id: "submit-btn" }, ["Submit"]),
			new FakeElement("button", { class: "primary" }, ["Another button"]),
			new FakeElement("input", { type: "text", name: "q", placeholder: "Search here" }),
			new FakeElement("select", { name: "pick" }, [
				new FakeElement("option", { value: "a" }, ["A"]),
			]),
			new FakeElement("div", { class: "wrap" }, [
				new FakeElement("a", { href: "/bar" }, ["Nested link"]),
				hidden,
			]),
			new FakeElement("form", { action: "/search" }, [
				new FakeElement("input", { name: "x", type: "text" }),
				new FakeElement("button", { type: "submit" }, ["Go"]),
			]),
			new FakeElement("button", { disabled: true }, ["Cannot click"]),
			new FakeElement("script", {}, ["var x = 1;"]),
			new FakeElement("style", {}, [".a { color: red; }"]),
		]),
	]);
	const document = {
		documentElement: page,
		doctype: { name: "html" },
		head: page.children[0],
		body: page.children[1],
		get title() {
			const t = page.children[0].children.find((c) => c.tagName === "TITLE");
			return t ? t.textContent : "";
		},
		querySelectorAll(selector) { return queryAllFrom(page, selector); },
		querySelector(selector) { return this.querySelectorAll(selector)[0] || null; },
	};
	return { document, page, hidden };
}

function loadExtractors() {
	const { document, page, hidden } = buildPage();
	const sandbox = {
		console,
		JSON,
		Math,
		CSS: { escape: (s) => String(s).replace(/([^a-zA-Z0-9_-])/g, "\\$1") },
		document,
		location: { href: "https://example.com/page" },
	};
	sandbox.globalThis = sandbox;
	vm.createContext(sandbox);
	vm.runInContext(EXTRACT, sandbox, { filename: "extract.js" });
	return { sandbox, document, page, hidden };
}

function snapshot(page) {
	return JSON.stringify(page, (key, value) => (key === "parentElement" ? undefined : value));
}

test("extractPageHtml: returns the live HTML in chunks, with the doctype", () => {
	const { sandbox, page } = loadExtractors();
	const before = snapshot(page);
	const full = sandbox.extractPageHtml({ start: 0, length: 60000 });
	assert.ok(full.html.startsWith("<!DOCTYPE html>"), "the chunk starts with the doctype");
	assert.ok(full.html.includes("<title>Test Page Title</title>"), "the HTML contains the title element");
	assert.equal(full.start, 0);
	assert.equal(full.truncated, false);
	assert.equal(full.length, full.totalLength);
	const first = sandbox.extractPageHtml({ start: 0, length: 50 });
	assert.equal(first.length, 50);
	assert.equal(first.truncated, true);
	assert.equal(first.totalLength, full.totalLength);
	const second = sandbox.extractPageHtml({ start: 50, length: 60000 });
	assert.equal(first.html + second.html, full.html, "chunks join back into the whole page");
	assert.equal(snapshot(page), before, "reading the HTML must not change the page");
});

test("extractPageDom: returns the parsed tree, skips script/style, caps depth and nodes", () => {
	const { sandbox, page } = loadExtractors();
	const before = snapshot(page);
	const { tree, nodeCount, truncated } = sandbox.extractPageDom({});
	assert.equal(tree.tag, "html");
	assert.equal(tree.attrs.lang, "en");
	assert.equal(tree.children.length, 2);
	assert.equal(tree.children[0].tag, "head");
	assert.equal(tree.children[1].tag, "body");
	const body = tree.children[1];
	const h1 = body.children.find((c) => c.tag === "h1");
	assert.equal(h1.text, "Main Heading");
	const link = body.children.find((c) => c.tag === "a");
	assert.equal(link.attrs.id, "link-foo");
	assert.equal(link.attrs.href, "/foo");
	assert.equal(link.text, "Go to foo");
	// Script and style nodes exist but have no children and no text.
	const script = body.children.find((c) => c.tag === "script");
	assert.ok(script);
	assert.equal(script.children, undefined);
	assert.equal(script.text, undefined);
	assert.ok(nodeCount > 10);
	assert.equal(truncated, false);
	// Depth cap: at depth 1 the body has no children.
	const shallow = sandbox.extractPageDom({ maxDepth: 1 });
	assert.equal(shallow.tree.children[1].children, undefined);
	assert.equal(shallow.truncated, true);
	// Node cap: 5 nodes, truncated.
	const few = sandbox.extractPageDom({ maxNodes: 5 });
	assert.equal(few.nodeCount, 5);
	assert.equal(few.truncated, true);
	assert.equal(snapshot(page), before, "reading the DOM must not change the page");
});

test("extractPageSummary: compact — headings, text, links, forms, word count", () => {
	const { sandbox, page } = loadExtractors();
	const before = snapshot(page);
	const s = sandbox.extractPageSummary({});
	assert.equal(s.title, "Test Page Title");
	assert.equal(s.url, "https://example.com/page");
	assert.equal(s.lang, "en");
	assert.equal(s.description, "A test page for the Shliach readers.");
	// Field-by-field via JSON: the objects were built inside the vm
	// context, so their prototypes differ from this realm's.
	assert.deepEqual(JSON.parse(JSON.stringify(s.headings)), [
		{ level: 1, text: "Main Heading" },
		{ level: 2, text: "Section One" },
	]);
	assert.ok(s.text.includes("First paragraph"));
	assert.ok(s.wordCount > 5);
	assert.ok(s.text.length <= 2000, "the summary text is capped");
	const foo = s.links.find((l) => l.href === "/foo");
	assert.ok(foo);
	assert.equal(foo.text, "Go to foo");
	assert.equal(s.forms.length, 1);
	assert.equal(s.forms[0].action, "/search");
	assert.equal(s.forms[0].fields[0].name, "x");
	assert.equal(snapshot(page), before, "summarizing must not change the page");
});

test("extractPageElements: every clickable element, each with a selector that selects it", () => {
	const { sandbox, document, page, hidden } = loadExtractors();
	const before = snapshot(page);
	const { elements, total, truncated } = sandbox.extractPageElements({});
	// The hidden span is not clickable and has no rect — it must not appear.
	assert.ok(!elements.some((e) => e.text === "Hidden text"), "hidden elements are not listed");
	// The disabled button IS listed, flagged.
	const disabled = elements.find((e) => e.text === "Cannot click");
	assert.ok(disabled);
	assert.equal(disabled.disabled, true);
	// The link, both primary buttons, the inputs, the select, the nested
	// link and the form button are all listed.
	assert.ok(elements.some((e) => e.tag === "a" && e.href === "/foo"));
	assert.ok(elements.some((e) => e.tag === "button" && e.text === "Submit"));
	assert.ok(elements.some((e) => e.tag === "button" && e.text === "Another button"));
	assert.ok(elements.some((e) => e.tag === "input" && e.name === "q" && e.placeholder === "Search here"));
	assert.ok(elements.some((e) => e.tag === "select" && e.name === "pick"));
	assert.ok(elements.some((e) => e.tag === "a" && e.href === "/bar"));
	assert.equal(total, elements.length);
	assert.equal(truncated, false);
	// EVERY selector is stable: running it through querySelector returns
	// the same element it was built from.
	for (const record of elements) {
		assert.ok(record.selector, `element ${record.tag} ${record.text} has no selector`);
		const found = document.querySelector(record.selector);
		assert.ok(found, `selector ${record.selector} selects nothing`);
		assert.equal(found.textContent.replace(/\s+/g, " ").trim(), record.text, `selector ${record.selector} selects the wrong element`);
	}
	assert.equal(snapshot(page), before, "listing elements must not change the page");
});

test("stableSelector: prefers #id, then tag.class, then a unique full path", () => {
	const { sandbox, document } = loadExtractors();
	const link = document.querySelector("#link-foo");
	assert.equal(sandbox.stableSelector(link), "#link-foo");
	const submit = document.querySelector("#submit-btn");
	assert.equal(sandbox.stableSelector(submit), "#submit-btn");
	// "Another button" has class "primary", but button.primary matches the
	// Submit button first, so it must fall back to a full path. It is the
	// second <button> directly under <body> (the form's button and the
	// disabled button do not share that parent / position).
	const buttons = document.querySelectorAll("button.primary");
	assert.equal(buttons.length, 2);
	const another = buttons[1];
	const sel = sandbox.stableSelector(another);
	assert.match(sel, /^html > body > button:nth-of-type\(2\)$/);
	assert.equal(document.querySelector(sel), another);
	// The nested link has no id and no class: full path. The div is the
	// only div under body and the link is the only <a> inside it, so no
	// :nth-of-type is needed at either step — the path is unique as-is.
	const nested = document.querySelectorAll("a[href]")[1];
	const nestedSel = sandbox.stableSelector(nested);
	assert.match(nestedSel, /^html > body > div > a$/);
	assert.equal(document.querySelector(nestedSel), nested);
});

test("extractPageElements: limit caps the list and reports truncation", () => {
	const { sandbox } = loadExtractors();
	const { elements, total, truncated } = sandbox.extractPageElements({ limit: 2 });
	assert.equal(elements.length, 2);
	assert.ok(total > 2);
	assert.equal(truncated, true);
});
