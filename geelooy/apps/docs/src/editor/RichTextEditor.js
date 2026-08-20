// B"H
// Boruch Hashem
// Blessed is He

import {
	applyDocumentBlockStyle,
	readDocumentBlockStyle
} from "../model/DocumentBlockStylePolicy.js";
import { HtmlSanitizer } from "../model/HtmlSanitizer.js";
import {
	selectedDocumentBlocks,
	selectionTouchesBlock
} from "./EditorBlockSelection.js";

/**
 * @file Renders and serializes independently synchronizable rich document blocks.
 * @description The Awtsmoos makes one page appear through many vessels; Awtsmoos.com
 * keeps each block named, styled, selectable, and safely reconcilable while the shared light remains one.
 */
const ALLOWED_TAGS = new Set([
	"p",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"blockquote",
	"pre",
	"ul",
	"ol",
	"table",
	"hr"
]);

export class RichTextEditor {
	constructor(root, onChange = () => {}) {
		this.root = root;
		this.onChange = onChange;
		this.editable = true;
		this.root.addEventListener("input", event => this.#handleInput(event));
		this.root.addEventListener("focusin", () => this.#ensureBlockIds());
	}

	render(blocks = []) {
		this.root.replaceChildren(...blocks.map(block => this.#createElement(block)));
		this.#ensureBlockIds();
	}

	readBlocks() {
		this.#ensureBlockIds();
		return Array.from(this.root.children).map(element => ({
			id: element.dataset.blockId,
			tag: element.tagName.toLowerCase(),
			html: HtmlSanitizer.sanitize(element.innerHTML),
			style: readDocumentBlockStyle(element)
		}));
	}

	applyRemoteBlocks(changes = []) {
		for (const block of changes) {
			if (selectionTouchesBlock(this.root, block.id)) continue;
			const selector = `[data-block-id="${CSS.escape(block.id)}"]`;
			const current = this.root.querySelector(selector);
			const replacement = this.#createElement(block);
			if (current) current.replaceWith(replacement);
			else this.root.append(replacement);
		}
	}

	updateBlockStyle(patch = {}) {
		const blocks = selectedDocumentBlocks(this.root);
		for (const block of blocks) {
			applyDocumentBlockStyle(block, {
				...readDocumentBlockStyle(block),
				...patch
			});
		}
		if (blocks.length) this.notifyMutation();
		return blocks.length;
	}

	setEditable(value) {
		this.editable = Boolean(value);
		this.root.contentEditable = this.editable ? "true" : "false";
		this.root.classList.toggle("is-readonly", !this.editable);
	}

	isEditable() {
		return this.editable;
	}

	focus() {
		this.root.focus({ preventScroll: true });
	}

	notifyMutation() {
		this.#ensureBlockIds();
		this.onChange(this.readBlocks(), null);
	}

	#handleInput(event) {
		this.#ensureBlockIds();
		const element = event.target.closest?.("[data-block-id]");
		this.onChange(this.readBlocks(), element?.dataset.blockId || null);
	}

	#ensureBlockIds() {
		if (!this.root.children.length) {
			this.root.append(this.#createElement({
				id: crypto.randomUUID(),
				tag: "p",
				html: "<br>"
			}));
		}
		for (const child of Array.from(this.root.children)) {
			if (!child.dataset.blockId) child.dataset.blockId = crypto.randomUUID();
		}
	}

	#createElement(block) {
		const tag = ALLOWED_TAGS.has(block.tag) ? block.tag : "p";
		const element = document.createElement(tag);
		element.dataset.blockId = String(block.id || crypto.randomUUID());
		element.innerHTML = HtmlSanitizer.sanitize(block.html || "");
		applyDocumentBlockStyle(element, block.style);
		return element;
	}
}
