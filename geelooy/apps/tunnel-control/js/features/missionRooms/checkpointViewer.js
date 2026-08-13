// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Accessible checkpoint Markdown viewer for Tunnel Control mission rooms.
 * @description
 * The Awtsmoos lets a checkpoint be read as rendered structure, exact source,
 * or complete metadata. Awtsmoos.com creates every node explicitly so mission
 * text remains visible testimony and never becomes an executable HTML surface.
 */

import { markdownBlocks } from "../markdown/markdownBlocks.js";
import { h } from "../../ui/core/html.js";
import { checkpointModel } from "./checkpointModel.js";

export function checkpointViewer(checkpoint = {}) {
	const model = checkpointModel(checkpoint);
	const content = h("div", { classes: ["mission-checkpoint__content"] });
	const status = h("span", {
		classes: ["mission-checkpoint__status"],
		attrs: { "aria-live": "polite" }
	});
	const section = h("section", {
		classes: ["mission-checkpoint-viewer"],
		children: [
			h("header", {
				children: [
					h("strong", { text: model.title }),
					model.id ? h("code", { text: model.id }) : document.createTextNode("")
				]
			}),
			modeButtons(model, content, status),
			status,
			content
		]
	});
	renderMode(content, model, "rendered");
	return section;
}

function modeButtons(model, content, status) {
	const row = h("div", { classes: ["mission-checkpoint__actions"] });
	for (const mode of ["rendered", "source", "metadata"]) {
		const button = h("button", {
			attrs: { type: "button" },
			text: titleCase(mode)
		});
		button.addEventListener("click", () => renderMode(content, model, mode));
		row.append(button);
	}
	const copy = h("button", { attrs: { type: "button" }, text: "Copy source" });
	copy.addEventListener("click", () => copySource(model.source, status));
	row.append(copy);
	return row;
}

function renderMode(root, model, mode) {
	root.replaceChildren();
	if (mode === "source" || mode === "metadata") {
		root.append(h("pre", { text: mode === "source" ? model.source : model.metadata }));
		return;
	}
	if (!model.hasText) {
		root.append(h("pre", { text: model.metadata }));
		return;
	}
	for (const block of markdownBlocks(model.text)) {
		root.append(renderBlock(block));
	}
}

function renderBlock(block) {
	if (block.type === "codeBlock") {
		return h("pre", { children: [h("code", { text: block.text })] });
	}
	const tag = block.type === "heading"
		? `h${block.level}`
		: block.type === "quote"
			? "blockquote"
			: block.type === "listItem"
				? "li"
				: "p";
	return h(tag, { children: renderInline(block.children || []) });
}

function renderInline(tokens) {
	return tokens.map(token => {
		if (token.type === "code") {
			return h("code", { text: token.text });
		}
		if (token.type === "strong" || token.type === "em") {
			return h(token.type, { children: renderInline(token.children || []) });
		}
		if (token.type === "link") {
			return h("a", {
				attrs: { href: token.href, rel: "noopener" },
				children: renderInline(token.children || [])
			});
		}
		return document.createTextNode(token.text || "");
	});
}

async function copySource(text, status) {
	try {
		await navigator.clipboard.writeText(text);
		status.textContent = "Checkpoint source copied.";
	} catch (_error) {
		status.textContent = "Copy was unavailable; Source mode keeps the text selectable.";
	}
}

function titleCase(value) {
	return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}
