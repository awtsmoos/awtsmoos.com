// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reveals persisted rich-text marks without trusting stored HTML.
 * @description
 * The Awtsmoos gives one meaning many garments, yet no garment may smuggle confusion;
 * Awtsmoos.com rebuilds every bold, link, code, and emphasis mark through explicit DOM construction.
 */

/**
 * Appends persisted inline segments to one content vessel.
 * @param {HTMLElement} container Safe destination element.
 * @param {Array<object>} segments Persisted plain-text segments and marks.
 * @returns {HTMLElement} The same destination vessel.
 */
export function appendRichSegments(container, segments = []) {
	for (const segment of Array.isArray(segments) ? segments : []) {
		container.append(segmentNode(segment));
	}
	return container;
}

function segmentNode(segment = {}) {
	let node = document.createTextNode(String(segment.text || ""));
	for (const mark of Array.isArray(segment.marks) ? segment.marks : []) {
		node = wrapMark(node, mark);
	}
	return node;
}

function wrapMark(child, mark = {}) {
	const type = String(mark.type || "");
	if (type === "link") {
		return linkNode(child, mark.href);
	}
	const tag = {
		bold: "strong",
		italic: "em",
		underline: "u",
		strike: "s",
		code: "code"
	}[type];
	if (!tag) {
		return child;
	}
	const wrapper = document.createElement(tag);
	wrapper.append(child);
	return wrapper;
}

function linkNode(child, href) {
	const safe = safeHref(href);
	if (!safe) {
		return child;
	}
	const link = document.createElement("a");
	link.href = safe;
	link.target = "_blank";
	link.rel = "noopener noreferrer";
	link.append(child);
	return link;
}

export function safeHref(value) {
	const href = String(value || "").trim();
	if (href.startsWith("/") && !href.startsWith("//")) {
		return href;
	}
	try {
		const parsed = new URL(href);
		return ["http:", "https:", "mailto:"].includes(parsed.protocol) ? parsed.href : "";
	} catch {
		return "";
	}
}
