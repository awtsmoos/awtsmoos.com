// B"H
// Boruch Hashem
// Blessed is He

import {
	applyDocumentBlockStyle,
	readDocumentBlockStyle
} from "../model/DocumentBlockStylePolicy.js";
import {
	createEditorBlockElement,
	ensureEditorBlockIds,
	readEditorBlocks
} from "./EditorBlockDom.js";
import {
	selectedDocumentBlocks,
	selectionTouchesBlock
} from "./EditorBlockSelection.js";

/**
 * @file Orchestrates synchronizable rich Awtsmoos document blocks in the browser.
 * @description The Awtsmoos is beyond DOM, cursor, and remote message; Awtsmoos.com
 * keeps render, selection-safe reconciliation, paragraph style, stable navigation
 * targets, and mutation signaling explicit so collaboration never leaves stale paths.
 */
export class RichTextEditor {
	constructor(root, onChange = () => {}) {
		this.root = root;
		this.onChange = onChange;
		this.editable = true;
		this.root.addEventListener("input", event => this.#handleInput(event));
		this.root.addEventListener("focusin", () => ensureEditorBlockIds(this.root));
	}

	/** Renders canonical blocks then projects editor identity and semantic navigation. */
	render(blocks = []) {
		this.root.replaceChildren(...blocks.map(createEditorBlockElement));
		ensureEditorBlockIds(this.root);
	}

	/** Reads the persistent semantic block representation from the living editor DOM. */
	readBlocks() {
		return readEditorBlocks(this.root);
	}

	/** Reconciles remote blocks without replacing the block currently touched by selection. */
	applyRemoteBlocks(changes = []) {
		for (const block of changes) {
			if (selectionTouchesBlock(this.root, block.id)) continue;
			const selector = `[data-block-id="${CSS.escape(block.id)}"]`;
			const current = this.root.querySelector(selector);
			const replacement = createEditorBlockElement(block);
			if (current) current.replaceWith(replacement);
			else this.root.append(replacement);
		}
		ensureEditorBlockIds(this.root);
	}

	/** Applies bounded paragraph-style metadata to all blocks touched by the selection. */
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

	/** Changes editor mutability without replacing document content or navigation state. */
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

	/** Records a structural mutation after re-establishing block and fragment identity. */
	notifyMutation() {
		ensureEditorBlockIds(this.root);
		this.onChange(this.readBlocks(), null);
	}

	#handleInput(event) {
		ensureEditorBlockIds(this.root);
		const element = event.target.closest?.("[data-block-id]");
		this.onChange(this.readBlocks(), element?.dataset.blockId || null);
	}
}
