// B"H
const { createPuppeteerCompat } = require("./puppeteer.js");
const { createPlaywrightCompat } = require("./playwright.js");

/** Installs standards-shaped DOM, Puppeteer, and Playwright compatibility. */
function installCompat(context, window) {
	installDocumentCompat(window);
	installDomMutationCompat(window);
	const puppeteer = createPuppeteerCompat(window, context);
	const playwright = createPlaywrightCompat(window, context);
	context.__nodeDomPage = playwright.page;
	context.puppeteer = puppeteer;
	context.playwright = playwright;
	context.chromium = playwright.chromium;
	context.window.__nodeDomPage = playwright.page;
}

function installDocumentCompat(window) {
	const document = window?.document;
	if (!document) return;
	document.location ||= window.location;
	defineGetter(document, "URL", () => window.location.href);
	defineGetter(document, "documentURI", () => window.location.href);
	defineGetter(document, "baseURI", () => window.location.href);
}

function installDomMutationCompat(window) {
	const sample = window?.document?.createElement?.("div");
	const proto = sample && Object.getPrototypeOf(sample);
	if (!proto) return;
	defineGetter(proto, "baseURI", function baseURI() {
		return this.ownerDocument?.baseURI || window.location.href;
	});
	if (typeof proto.insertAdjacentHTML !== "function") {
		proto.insertAdjacentHTML = function insertAdjacentHTML(position, markup) {
			insertHtml(window, this, position, markup);
		};
	}
	if (typeof proto.remove !== "function") proto.remove = function remove() {
		if (this.parentNode) this.parentNode.removeChild(this);
	};
	if (typeof proto.replaceWith !== "function") proto.replaceWith = function replaceWith(...nodes) {
		const parent = this.parentNode;
		if (!parent) return;
		for (const node of nodes) parent.insertBefore(asNode(window, node), this);
		parent.removeChild(this);
	};
	if (typeof proto.before !== "function") proto.before = function before(...nodes) {
		const parent = this.parentNode;
		if (!parent) return;
		for (const node of nodes) parent.insertBefore(asNode(window, node), this);
	};
	if (typeof proto.after !== "function") proto.after = function after(...nodes) {
		const parent = this.parentNode;
		if (!parent) return;
		const ref = this.nextSibling;
		for (const node of nodes) parent.insertBefore(asNode(window, node), ref);
	};
}

function insertHtml(window, target, position, markup) {
	const where = String(position || "").toLowerCase();
	if (!["beforebegin", "afterbegin", "beforeend", "afterend"].includes(where)) {
		throw new Error("Invalid insertAdjacentHTML position: " + position);
	}
	const holder = window.document.createElement("div");
	holder.innerHTML = String(markup ?? "");
	const nodes = [...holder.childNodes];
	if (where === "beforeend") return nodes.forEach(node => target.appendChild(node));
	if (where === "afterbegin") {
		const ref = target.firstChild;
		return nodes.forEach(node => target.insertBefore(node, ref));
	}
	const parent = target.parentNode;
	if (!parent) return;
	const ref = where === "beforebegin" ? target : target.nextSibling;
	return nodes.forEach(node => parent.insertBefore(node, ref));
}

function defineGetter(target, name, getter) {
	if (Object.getOwnPropertyDescriptor(target, name)) return;
	Object.defineProperty(target, name, { configurable: true, enumerable: true, get: getter });
}

function asNode(window, value) {
	if (value && typeof value === "object" && "nodeType" in value) return value;
	return window.document.createTextNode(String(value));
}

module.exports = { installCompat, installDocumentCompat, installDomMutationCompat, insertHtml };
