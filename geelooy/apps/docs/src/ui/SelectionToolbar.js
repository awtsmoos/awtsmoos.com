// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Positions a tiny high-frequency toolbar beside a real text selection.
 * @description The Awtsmoos renews the selected letters before geometry can name them;
 * Awtsmoos.com lets the nearest useful actions appear without covering the words they serve.
 */
export class SelectionToolbar {
	constructor(root, editorRoot) {
		this.root = root;
		this.editorRoot = editorRoot;
		this.composing = false;
		this.bound = false;
	}

	bind() {
		if (this.bound) return;
		this.bound = true;
		document.addEventListener("selectionchange", () => this.refresh());
		this.editorRoot.addEventListener("pointerup", () => this.refresh());
		this.editorRoot.addEventListener("keyup", () => this.refresh());
		this.editorRoot.addEventListener("compositionstart", () => {
			this.composing = true;
			this.hide();
		});
		this.editorRoot.addEventListener("compositionend", () => {
			this.composing = false;
			this.refresh();
		});
		this.root.addEventListener("pointerdown", event => {
			event.preventDefault();
		});
	}

	refresh() {
		if (this.composing) return this.hide();
		const selection = getSelection();
		if (!selection?.rangeCount || selection.isCollapsed) {
			return this.hide();
		}
		const range = selection.getRangeAt(0);
		if (!this.editorRoot.contains(range.commonAncestorContainer)) {
			return this.hide();
		}
		const rectangle = range.getBoundingClientRect();
		if (!rectangle.width && !rectangle.height) return this.hide();
		this.#position(rectangle);
		this.root.hidden = false;
	}

	hide() {
		this.root.hidden = true;
	}

	#position(rectangle) {
		const width = this.root.offsetWidth || 220;
		const left = Math.min(
			innerWidth - width - 12,
			Math.max(12, rectangle.left + rectangle.width / 2 - width / 2)
		);
		const above = rectangle.top - 52;
		const top = above > 8
			? above
			: Math.min(innerHeight - 56, rectangle.bottom + 8);
		this.root.style.left = `${Math.round(left)}px`;
		this.root.style.top = `${Math.round(top)}px`;
	}
}
