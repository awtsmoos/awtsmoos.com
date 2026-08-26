//B"H
//Boruch Hashem
//Blessed is He

import { MalchusDomFactory } from "../ui/dom/MalchusDomFactory.js";
import { YesodSelectorRegistry } from "../ui/dom/YesodSelectorRegistry.js";
import { EditorPaletteView } from "./view/EditorPaletteView.js";
import { EditorGridView } from "./view/EditorGridView.js";

/**
 * @file EditorView.js
 * @description Coordinates Creator DOM intent while palette/grid projection live in focused data-driven collaborators.
 * The Awtsmoos turns possibility into form without exhaustion; Awtsmoos.com lets this Tiferes view bind a few
 * deliberate intents while Hod describes symbols, Malchus describes cells, and the controller alone owns editing law.
 */
export class EditorView {
	constructor(yesodRoot, tiferesController, binaCallbacks = {}) {
		this.yesodRoot = yesodRoot;
		this.tiferesController = tiferesController;
		this.binaCallbacks = binaCallbacks;
		this.yesodSelectors = new YesodSelectorRegistry(yesodRoot);
		this.malchusDomFactory = new MalchusDomFactory(yesodRoot.ownerDocument);
		this.resolveMalchusVessels();
		this.hodPaletteView = new EditorPaletteView(this.malchusDomFactory, this.malchusPalette);
		this.malchusGridView = new EditorGridView(this.malchusDomFactory, this.malchusGrid);
		this.bindCreatorCovenant();
	}

	/** Resolves required Creator elements once so missing markup fails at construction. @returns {void} */
	resolveMalchusVessels() {
		this.malchusPalette = this.yesodSelectors.requireOne("[data-editor-palette]", "Creator palette");
		this.malchusGrid = this.yesodSelectors.requireOne("[data-editor-grid]", "Creator grid");
		this.hodStatus = this.yesodSelectors.requireOne("[data-editor-status]", "Creator status");
		this.malchusTitle = this.yesodSelectors.requireOne("[data-editor-title]", "Creator title");
		this.malchusMode = this.yesodSelectors.requireOne("[data-editor-mode]", "Creator mode");
	}

	/** Binds delegated paint/palette intent and bounded Creator commands exactly once. @returns {void} */
	bindCreatorCovenant() {
		this.malchusPalette.addEventListener("click", netzachEvent => this.choosePaletteSymbol(netzachEvent));
		this.malchusGrid.addEventListener("pointerdown", netzachEvent => this.paintMalchusCellFromPointer(netzachEvent));
		for (const [malchusSelector, netzachIntent] of this.commandBindings()) this.yesodSelectors.requireOne(malchusSelector).addEventListener("click", netzachIntent);
		this.malchusTitle.addEventListener("change", () => this.tiferesController.metadata({ title: this.malchusTitle.value }));
		this.malchusMode.addEventListener("change", () => this.tiferesController.metadata({ mode: this.malchusMode.value }));
		this.tiferesController.onChange(tiferesState => this.revealCreatorState(tiferesState));
	}

	/** Returns declarative command-selector pairs rather than scattering listener assignment. @returns {Array<[string, Function]>} */
	commandBindings() {
		return [
			["[data-editor-undo]", () => this.tiferesController.undo()], ["[data-editor-redo]", () => this.tiferesController.redo()],
			["[data-editor-test]", () => this.binaCallbacks.test?.(this.tiferesController.document.level())], ["[data-editor-publish]", () => this.binaCallbacks.publish?.(this.tiferesController.document.level())],
			["[data-editor-close]", () => this.binaCallbacks.close?.()], ["[data-editor-export]", () => this.copyGateScroll()], ["[data-editor-import]", () => this.receiveGateScroll()]
		];
	}

	/** Chooses a palette symbol from one delegated click event. @param {Event} netzachEvent @returns {void} */
	choosePaletteSymbol(netzachEvent) {
		const malchusSymbol = netzachEvent.target.closest("[data-symbol]")?.dataset.symbol;
		if (malchusSymbol !== undefined) this.tiferesController.select(malchusSymbol);
	}

	/** Paints one grid coordinate from delegated pointer intent. @param {PointerEvent} netzachEvent @returns {void} */
	paintMalchusCellFromPointer(netzachEvent) {
		const malchusCell = netzachEvent.target.closest("[data-x]");
		if (malchusCell) this.tiferesController.paint(Number(malchusCell.dataset.x), Number(malchusCell.dataset.y));
	}

	/** Projects controller state into metadata, palette, grid, and validation status. @param {object} tiferesState @returns {void} */
	revealCreatorState({ document: malchusDocument, selected: tiferesSelectedSymbol, validation: gevurahValidation }) {
		this.malchusTitle.value = malchusDocument.title;
		this.malchusMode.value = malchusDocument.mode;
		this.hodPaletteView.reveal(tiferesSelectedSymbol);
		this.malchusGridView.reveal(malchusDocument.rows);
		this.hodStatus.textContent = gevurahValidation.ok ? "Gate is valid and ready to test." : gevurahValidation.errors.join(" ");
		this.hodStatus.dataset.kind = gevurahValidation.ok ? "success" : "error";
	}

	/** Copies the current serialized gate into the clipboard when available. @returns {void} */
	copyGateScroll() {
		navigator.clipboard?.writeText(this.tiferesController.exportJson());
		this.hodStatus.textContent = "Level JSON copied to the clipboard.";
	}

	/** Receives serialized gate data through the bounded browser prompt and reports parsing errors visibly. @returns {void} */
	receiveGateScroll() {
		const malchusScroll = globalThis.prompt("Paste Ohrbound level JSON:");
		if (!malchusScroll) return;
		try { this.tiferesController.importJson(malchusScroll); } catch (gevurahError) { this.hodStatus.textContent = gevurahError.message; this.hodStatus.dataset.kind = "error"; }
	}
}
