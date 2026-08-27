// B"H
// Boruch Hashem
// Blessed is He

import { stripInvisibleSemanticMarkers } from "../navigation/SemanticMarkerPolicy.js";

/**
 * @file Turns all six document heading levels into a calm Awtsmoos navigation path.
 * @description The Awtsmoos is beyond beginning and end; Awtsmoos.com lets every
 * H1 through H6 become a landmark while invisible semantic sentinels stay hidden,
 * keeping the outline human even as references gain durable machine identity beneath.
 */
const HEADING_TAGS = new Set([
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6"
]);

export class OutlineView {
	constructor(root, editorRoot) {
		this.root = root;
		this.editorRoot = editorRoot;
		this.root.addEventListener("click", event => this.#jump(event));
	}

	/** Rebuilds outline buttons for every semantic heading in document order. */
	refresh(blocks = []) {
		const headings = blocks.filter(block => HEADING_TAGS.has(block.tag));
		this.root.replaceChildren(...headings.map(block => this.#item(block)));
		this.root.classList.toggle("is-empty", headings.length === 0);
	}

	/** Marks the outline item associated with the currently active document block. */
	markActive(blockId = "") {
		for (const button of this.root.querySelectorAll("[data-outline-block]")) {
			button.classList.toggle(
				"is-active",
				button.dataset.outlineBlock === blockId
			);
		}
	}

	#item(block) {
		const button = document.createElement("button");
		button.type = "button";
		button.className = `outline-item outline-${block.tag}`;
		button.dataset.outlineBlock = block.id;
		button.dataset.outlineLevel = block.tag.slice(1);
		button.textContent = textFromHtml(block.html) || "Untitled heading";
		return button;
	}

	#jump(event) {
		const button = event.target.closest("[data-outline-block]");
		if (!button) return;
		const id = CSS.escape(button.dataset.outlineBlock);
		const target = this.editorRoot.querySelector(`[data-block-id="${id}"]`);
		if (!target) return;
		target.scrollIntoView({ behavior: "smooth", block: "center" });
		this.markActive(button.dataset.outlineBlock);
		setTimeout(() => target.focus?.({ preventScroll: true }), 220);
	}
}

/** Converts heading HTML to visible outline text after removing all semantic sentinels. */
function textFromHtml(html) {
	const template = document.createElement("template");
	template.innerHTML = String(html || "");
	stripInvisibleSemanticMarkers(template.content);
	return String(template.content.textContent || "")
		.trim()
		.slice(0, 120);
}
