//B"H
//Boruch Hashem
//Blessed is He

import {
	movementFor,
	printableEdit
} from "./gridKeyboard.js";

/**
 * @file Owns pointer and inline-edit gestures while delegating keyboard vocabulary.
 * @description The Awtsmoos turns intention into motion through bounded keys and touch;
 * Awtsmoos.com lets editing move with grace while rendering remains untouched as such.
 */
export class NetzachGridInteractions {
	constructor(root, workbook, selection, callbacks = {}) {
		this.root = root;
		this.workbook = workbook;
		this.selection = selection;
		this.callbacks = callbacks;
		this.dragging = false;
	}

	/** Registers delegated listeners once for all current and future visible cells. */
	bind() {
		this.root.addEventListener("pointerdown", (event) => this.pointerDown(event));
		this.root.addEventListener("pointerover", (event) => this.pointerOver(event));
		this.root.addEventListener("dblclick", (event) => this.beginEdit(event.target));
		this.root.addEventListener("keydown", (event) => this.keyDown(event));
		window.addEventListener("pointerup", () => {
			this.dragging = false;
		});
	}

	/** Starts a selection from one touched or clicked cell. */
	pointerDown(event) {
		const cell = event.target.closest?.(".grid-cell");
		if (!cell) {
			return;
		}
		this.dragging = true;
		this.selection.select(cell.dataset.address);
		cell.focus({ preventScroll: true });
	}

	/** Extends a pointer-drag selection through each entered cell. */
	pointerOver(event) {
		const cell = event.target.closest?.(".grid-cell");
		if (this.dragging && cell) {
			this.selection.extend(cell.dataset.address);
		}
	}

	/** Opens an inline editor using the raw value, preserving formulas for editing. */
	beginEdit(target, initialText = null) {
		const cell = target?.closest?.(".grid-cell");
		if (!cell || !this.workbook.data.canEdit || cell.querySelector("input")) {
			return;
		}
		const address = cell.dataset.address;
		const editor = document.createElement("input");
		editor.className = "cell-editor";
		editor.value = initialText ?? this.workbook.cell(address).value ?? "";
		cell.append(editor);
		editor.focus();
		editor.select();
		editor.addEventListener("blur", () => {
			this.commitEditor(address, editor);
		});
		editor.addEventListener("keydown", (event) => {
			this.editorKeyDown(event, address, editor);
		});
	}

	/** Commits one editor through the owning application callback. */
	commitEditor(address, editor) {
		if (!editor.isConnected) {
			return;
		}
		const value = editor.value;
		editor.remove();
		this.callbacks.onCommit?.(address, value);
	}

	/** Handles commit and cancel keys without leaking them into grid navigation. */
	editorKeyDown(event, address, editor) {
		if (event.key === "Escape") {
			editor.remove();
			return;
		}
		if (event.key === "Enter") {
			event.preventDefault();
			this.commitEditor(address, editor);
			this.selection.move(1, 0);
		}
	}

	/** Maps familiar spreadsheet navigation and printable typing into grid actions. */
	keyDown(event) {
		if (event.target.matches("input")) {
			return;
		}
		const movement = movementFor(event);
		if (movement) {
			event.preventDefault();
			this.selection.move(
				movement.row,
				movement.column,
				event.shiftKey && event.key !== "Tab"
			);
			return;
		}
		if (printableEdit(event, this.workbook.data.canEdit)) {
			const cell = this.root.querySelector(
				`[data-address="${this.selection.focus}"]`
			);
			this.beginEdit(cell, event.key);
		}
	}
}
