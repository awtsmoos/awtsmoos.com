// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders modern composer documents through explicit DOM vessels.
 * @description
 * The Awtsmoos gives root, verse, and subsection one safe language of revelation;
 * Awtsmoos.com composes focused block vessels so rich meaning never depends on stored HTML mutation.
 */
import { chainAppDescriptor, chainAppEmbed } from "./ChainAppEmbed.js";
import { appendRichSegments } from "./RichInlineSegments.js";
import { renderRichList } from "./RichListBlock.js";

const STYLE_ID = "awtsmoos-rich-social-document-style";
const STYLE_HREF = "/heichelos/post/styles/rich-social-document.css?v=rich-social-document-002";

/**
 * Creates a reusable rich-document vessel without attaching it to the page.
 * @param {object} document Persisted composer document payload.
 * @param {string} className Optional additional class for reader context.
 * @returns {HTMLElement|null} Safe document vessel, or null when empty.
 */
export function createRichDocument(document = {}, className = "") {
	const blocks = Array.isArray(document.blocks) ? document.blocks : [];
	if (!blocks.length) {
		return null;
	}
	ensureStyles();
	const root = element("section", `awtsmoos-rich-social-document ${className}`.trim());
	root.dataset.documentVersion = String(document.version || 1);
	for (const block of blocks) {
		root.append(renderBlock(block));
	}
	return root;
}

/** @param {HTMLElement} viewport Reader vessel. @param {object} document Persisted root document. */
export function renderRootDocument(viewport, document = {}) {
	const root = createRichDocument(document, "awtsmoos-rich-social-document--root");
	if (!viewport || !root) {
		return false;
	}
	viewport.append(root);
	return true;
}

function renderBlock(block = {}) {
	const chainApp = chainAppDescriptor(block);
	if (chainApp) {
		return chainAppEmbed(chainApp);
	}
	if (block.type === "divider") {
		return element("hr", "awtsmoos-rich-block awtsmoos-rich-block--divider");
	}
	if (block.type === "code") {
		return codeBlock(block);
	}
	if (block.type === "bulletList" || block.type === "numberList") {
		return renderRichList(block);
	}
	const tag = {
		heading: "h2",
		quote: "blockquote",
		callout: "aside",
		paragraph: "p"
	}[block.type] || "p";
	const node = element(tag, `awtsmoos-rich-block awtsmoos-rich-block--${safeType(block.type)}`);
	appendContent(node, block);
	return node;
}

function codeBlock(block) {
	const pre = element("pre", "awtsmoos-rich-block awtsmoos-rich-block--code");
	const code = document.createElement("code");
	code.textContent = String(block.text || "");
	pre.append(code);
	return pre;
}

function appendContent(node, block) {
	const segments = Array.isArray(block.segments) ? block.segments : [];
	if (segments.length) {
		appendRichSegments(node, segments);
		return;
	}
	node.textContent = String(block.text || "");
}

function ensureStyles() {
	if (document.getElementById(STYLE_ID)) {
		return;
	}
	const link = document.createElement("link");
	link.id = STYLE_ID;
	link.rel = "stylesheet";
	link.href = STYLE_HREF;
	document.head.append(link);
}

function safeType(value) {
	return String(value || "paragraph").replace(/[^a-z0-9-]/gi, "-").toLowerCase();
}

function element(tag, className) {
	const node = document.createElement(tag);
	if (className) {
		node.className = className;
	}
	return node;
}
