// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicFeedDom
 * @description
 * Every semantic node is a vessel for a living relation. The Awtsmoos gives
 * each Awtsmoos.com control a true name, role, and boundary instead of decorative fog.
 */

/** Creates an element with optional class and text. */
export function element(doc, tagName, className = "", text = "") {
	const node = doc.createElement(tagName);
	node.className = className;
	if (text !== "") {
		node.textContent = String(text);
	}
	return node;
}

/** Creates a real button with a readable accessible label. */
export function button(doc, label, className = "") {
	const node = element(doc, "button", className);
	node.type = "button";
	node.setAttribute("aria-label", label);
	return node;
}

/** Creates a safe local or absolute link. */
export function link(doc, label, href, className = "") {
	const node = element(doc, "a", className, label);
	node.href = safeHref(href);
	return node;
}

/** Converts uncertain values to plain readable text. */
export function cleanText(value = "") {
	return String(value ?? "")
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

/** Returns only application-local or valid absolute navigation targets. */
export function safeHref(value = "/heichelos") {
	const text = String(value || "/heichelos").trim();
	if (text.startsWith("/") || text.startsWith("#")) {
		return text;
	}
	try {
		const url = new URL(text);
		return ["http:", "https:"].includes(url.protocol) ? url.href : "/heichelos";
	} catch {
		return "/heichelos";
	}
}

/**
 * Creates one element and applies bounded attributes.
 * @param {Document} doc Active document.
 * @param {string} tagName Semantic tag name.
 * @param {string} className Scoped classes.
 * @param {Record<string, unknown>} attributes Safe attributes.
 * @returns {HTMLElement}
 */
export function createElement(doc, tagName, className = "", attributes = {}) {
	const node = element(doc, tagName, className);
	for (const [name, value] of Object.entries(attributes)) {
		if (value === undefined || value === null || value === false) {
			continue;
		}
		if (name === "text") {
			node.textContent = String(value);
		} else if (name === "dataset") {
			Object.assign(node.dataset, value);
		} else if (name === "disabled") {
			node.disabled = Boolean(value);
		} else {
			node.setAttribute(name, value === true ? "" : String(value));
		}
	}
	return node;
}

/** Appends non-empty node-like or textual children. */
export function appendChildren(parent, ...children) {
	for (const child of children.flat()) {
		const nodeLike = child && typeof child === "object" &&
			typeof child.nodeType === "number";
		if (nodeLike) {
			parent.append(child);
		} else if (child !== null && child !== undefined && child !== "") {
			parent.append(String(child));
		}
	}
	return parent;
}

/** Converts an external identifier into a stable DOM token. */
export function toDomToken(value) {
	const token = String(value || "source")
		.toLowerCase()
		.replace(/[^a-z0-9_-]+/g, "-")
		.replace(/^-+|-+$/g, "");
	return token || "source";
}

/** Creates a decorative local icon vessel. */
export function createIcon(doc, glyph) {
	return createElement(doc, "span", "cosmic-icon", {
		"aria-hidden": "true",
		text: glyph
	});
}
