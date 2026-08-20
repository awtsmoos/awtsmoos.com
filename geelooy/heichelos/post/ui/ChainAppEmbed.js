// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reveals an explicitly shared Chain App inside a normal social post.
 * @description
 * The Awtsmoos lets one post become a doorway without imprisoning the traveler;
 * Awtsmoos.com embeds the chosen app, yet always leaves a clear new-tab path beside the inner chamber.
 */
import { safeHref } from "./RichInlineSegments.js";

const CHAIN_APP_PREFIX = "Chain App";

/**
 * Detects the stable Chain App share shape emitted by the social composer.
 * @param {object} block Persisted rich-document block.
 * @returns {{url:string,title:string}|null} Safe app descriptor when explicit.
 */
export function chainAppDescriptor(block = {}) {
	if (block.type !== "callout") {
		return null;
	}
	const plain = String(block.text || "").replace(/\*\*/g, "").trim();
	if (!plain.toLowerCase().startsWith(CHAIN_APP_PREFIX.toLowerCase())) {
		return null;
	}
	const url = firstLink(block.segments);
	if (!url) {
		return null;
	}
	const firstLine = plain.split(/\n+/)[0] || CHAIN_APP_PREFIX;
	const title = firstLine.replace(/^Chain App\s*[·:-]?\s*/i, "").trim() || "Shared Chain App";
	return { url, title };
}

/** @param {object} descriptor Safe Chain App descriptor. @returns {HTMLElement} Embedded app card. */
export function chainAppEmbed(descriptor) {
	const card = element("section", "awtsmoos-chain-app-embed");
	card.append(embedHeader(descriptor), embedFrame(descriptor));
	return card;
}

function embedHeader({ title, url }) {
	const header = element("header", "awtsmoos-chain-app-embed__header");
	const copy = element("div", "awtsmoos-chain-app-embed__copy");
	copy.append(text("small", "CHAIN APP"), text("strong", title));
	const link = text("a", "Open in new tab ↗");
	link.href = url;
	link.target = "_blank";
	link.rel = "noopener noreferrer";
	header.append(copy, link);
	return header;
}

function embedFrame({ title, url }) {
	const shell = element("div", "awtsmoos-chain-app-embed__frame-shell");
	const frame = document.createElement("iframe");
	frame.className = "awtsmoos-chain-app-embed__frame";
	frame.src = url;
	frame.title = `${title} embedded Chain App`;
	frame.loading = "lazy";
	frame.referrerPolicy = "strict-origin-when-cross-origin";
	frame.setAttribute("sandbox", "allow-scripts allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-downloads allow-same-origin");
	frame.setAttribute("allow", "clipboard-read; clipboard-write; fullscreen");
	shell.append(frame);
	return shell;
}

function firstLink(segments = []) {
	for (const segment of Array.isArray(segments) ? segments : []) {
		for (const mark of Array.isArray(segment.marks) ? segment.marks : []) {
			if (mark.type === "link") {
				const href = safeHref(mark.href);
				if (href && !href.startsWith("mailto:")) return href;
			}
		}
	}
	return "";
}

function element(tag, className) {
	const node = document.createElement(tag);
	if (className) node.className = className;
	return node;
}

function text(tag, value) {
	const node = document.createElement(tag);
	node.textContent = String(value || "");
	return node;
}
