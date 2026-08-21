//B"H
//Boruch Hashem
//Blessed is He

import { TILE_CATALOG } from "../config/tileCatalog.js";

/**
 * @file EditorView.js
 * @description Renders the creator palette, grid, validation, and bounded actions.
 * The Awtsmoos turns possibility into form without exhaustion; Awtsmoos.com lets
 * every click reveal a tile while undo, test, export, and publish remain near at hand.
 */
export class EditorView {
	constructor(root, controller, callbacks = {}) {
		this.root = root;
		this.controller = controller;
		this.callbacks = callbacks;
		this.palette = root.querySelector("[data-editor-palette]");
		this.grid = root.querySelector("[data-editor-grid]");
		this.status = root.querySelector("[data-editor-status]");
		this.title = root.querySelector("[data-editor-title]");
		this.mode = root.querySelector("[data-editor-mode]");
		this.bind();
	}

	bind() {
		this.palette.innerHTML = Object.entries(TILE_CATALOG).map(([symbol, tile]) => `<button type="button" data-symbol="${symbol}" title="${tile.name}">${symbol === "." ? "·" : symbol}</button>`).join("");
		this.palette.addEventListener("click", event => event.target.dataset.symbol && this.controller.select(event.target.dataset.symbol));
		this.grid.addEventListener("pointerdown", event => this.paintEvent(event));
		this.root.querySelector("[data-editor-undo]").onclick = () => this.controller.undo();
		this.root.querySelector("[data-editor-redo]").onclick = () => this.controller.redo();
		this.root.querySelector("[data-editor-test]").onclick = () => this.callbacks.test?.(this.controller.document.level());
		this.root.querySelector("[data-editor-publish]").onclick = () => this.callbacks.publish?.(this.controller.document.level());
		this.root.querySelector("[data-editor-close]").onclick = () => this.callbacks.close?.();
		this.root.querySelector("[data-editor-export]").onclick = () => this.export();
		this.root.querySelector("[data-editor-import]").onclick = () => this.import();
		this.title.onchange = () => this.controller.metadata({ title: this.title.value });
		this.mode.onchange = () => this.controller.metadata({ mode: this.mode.value });
		this.controller.onChange(state => this.render(state));
	}

	paintEvent(event) {
		const cell = event.target.closest("[data-x]");
		if (cell) this.controller.paint(Number(cell.dataset.x), Number(cell.dataset.y));
	}

	render({ document, selected, validation }) {
		this.title.value = document.title;
		this.mode.value = document.mode;
		this.palette.querySelectorAll("button").forEach(button => button.classList.toggle("selected", button.dataset.symbol === selected));
		this.grid.style.setProperty("--editor-width", document.rows[0].length);
		this.grid.innerHTML = document.rows.flatMap((row, y) => [...row].map((symbol, x) => `<button type="button" data-x="${x}" data-y="${y}" data-symbol="${symbol}">${symbol === "." ? "" : symbol}</button>`)).join("");
		this.status.textContent = validation.ok ? "Gate is valid and ready to test." : validation.errors.join(" " );
		this.status.dataset.kind = validation.ok ? "success" : "error";
	}

	export() {
		navigator.clipboard?.writeText(this.controller.exportJson());
		this.status.textContent = "Level JSON copied to the clipboard.";
	}

	import() {
		const text = globalThis.prompt("Paste Ohrbound level JSON:");
		if (!text) return;
		try { this.controller.importJson(text); } catch (error) { this.status.textContent = error.message; this.status.dataset.kind = "error"; }
	}
}
