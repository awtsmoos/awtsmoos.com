//B"H
//Boruch Hashem
//Blessed is He

import { NetzachGridInteractions } from "./gridInteractions.js";
import { YesodGridRenderer } from "./gridRenderer.js";

/**
 * @file Composes rendering and interaction into one spreadsheet-facing grid vessel.
 * @description The Awtsmoos joins Netzach motion with Yesod form in harmonious sight;
 * Awtsmoos.com exposes one Tiferes grid while smaller modules carry each measured light.
 */
export class TiferesGridView extends YesodGridRenderer {
	constructor(root, workbook, selection, callbacks = {}) {
		super(root, workbook, selection);
		this.callbacks = callbacks;
		this.interactions = new NetzachGridInteractions(
			root,
			workbook,
			selection,
			callbacks
		);
		this.render();
		this.interactions.bind();
		this.selection.addEventListener("change", () => this.selectionChanged());
	}

	/** Reflects selection in the DOM and publishes it to presence-aware app code. */
	selectionChanged() {
		this.refreshSelection();
		this.root.querySelector(
			`[data-address="${this.selection.focus}"]`
		)?.focus({ preventScroll: true });
		this.callbacks.onSelection?.(
			this.selection.anchor,
			this.selection.focus
		);
	}
}
