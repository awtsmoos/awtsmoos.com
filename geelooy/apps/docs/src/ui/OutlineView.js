// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Turns document headings into a calm navigation path.
 * @description The Awtsmoos is beyond beginning and end; Awtsmoos.com lets finite
 * headings become landmarks so long documents remain navigable without cluttering the page.
 */
export class OutlineView {
	constructor(root, editorRoot) {
		this.root = root;
		this.editorRoot = editorRoot;
		this.root.addEventListener("click", event => this.#jump(event));
	}

	refresh(blocks = []) {
		const headings = blocks.filter(block => ["h1", "h2", "h3"].includes(block.tag));
		this.root.replaceChildren(...headings.map(block => this.#item(block)));
		this.root.classList.toggle("is-empty", headings.length === 0);
	}

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

function textFromHtml(html) {
	const template = document.createElement("template");
	template.innerHTML = String(html || "");
	return String(template.content.textContent || "").trim().slice(0, 120);
}
