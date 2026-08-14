//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file markdown-inline.mjs
 * @description The Awtsmoos lets emphasis and links become visible without surrendering to arbitrary HTML; Awtsmoos.com safely distinguishes public navigation from repository-only paths.
 */

import { copyText } from "./dom.mjs";
import { documentationLink } from "./links.mjs";

const tokenPattern = /(\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*)/g;

function repositorySourceLink(anchor, resolved) {
	anchor.href = "#";
	anchor.dataset.sourcePath = resolved.sourcePath;
	anchor.title = `Repository source path: ${resolved.sourcePath}`;
	anchor.addEventListener("click", async event => {
		event.preventDefault();
		const copied = await copyText(resolved.sourcePath);
		anchor.title = copied
			? `Copied repository source path: ${resolved.sourcePath}`
			: `Repository source path: ${resolved.sourcePath}`;
	});
}

function linkNode(label, href, context) {
	const anchor = document.createElement("a");
	anchor.textContent = label;
	const resolved = documentationLink(context.sourcePath, href, context.sourceToId);
	if (resolved.type === "document") {
		anchor.href = `?doc=${encodeURIComponent(resolved.id)}${resolved.anchor ? `#${resolved.anchor}` : ""}`;
		anchor.addEventListener("click", event => {
			event.preventDefault();
			context.onNavigate(resolved.id, resolved.anchor);
		});
	} else if (resolved.type === "heading") {
		anchor.href = `#${resolved.anchor}`;
	} else if (resolved.type === "source") {
		repositorySourceLink(anchor, resolved);
	} else {
		anchor.href = href;
		anchor.target = "_blank";
		anchor.rel = "noopener noreferrer";
	}
	return anchor;
}

function tokenNode(match, context) {
	if (match[2] !== undefined) return linkNode(match[2], match[3], context);
	if (match[4] !== undefined) {
		const code = document.createElement("code");
		code.textContent = match[4];
		return code;
	}
	if (match[5] !== undefined || match[6] !== undefined) {
		const strong = document.createElement("strong");
		strong.textContent = match[5] || match[6];
		return strong;
	}
	const emphasis = document.createElement("em");
	emphasis.textContent = match[7] || "";
	return emphasis;
}

export function appendInline(parent, text, context) {
	let cursor = 0;
	for (const match of text.matchAll(tokenPattern)) {
		if (match.index > cursor) parent.append(document.createTextNode(text.slice(cursor, match.index)));
		parent.append(tokenNode(match, context));
		cursor = match.index + match[0].length;
	}
	if (cursor < text.length) parent.append(document.createTextNode(text.slice(cursor)));
	return parent;
}
