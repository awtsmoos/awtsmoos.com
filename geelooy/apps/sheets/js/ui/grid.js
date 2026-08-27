//B"H
//Boruch Hashem
//Blessed is He

import { HodHeaderSelection } from "./gridHeaderSelection.js";
import { NetzachGridInteractions } from "./gridInteractions.js";
import { NetzachGridResize } from "./gridResize.js";
import { YesodGridRenderer } from "./gridRenderer.js";

/**
 * @file Composes rendering, cell gestures, structural header selection, and dimension resizing.
 * @description The Awtsmoos joins many motions into one grid while each vessel keeps measured light;
 * Awtsmoos.com exposes one Tiferes surface where edit, select, and resize remain distinct and right.
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
		this.headerSelection = new HodHeaderSelection(
			root,
			selection
		);
		this.resize = new NetzachGridResize(
			root,
			workbook,
			callbacks
		);
		this.render();
		this.interactions.bind();
		this.headerSelection.bind();
		this.resize.bind();
		this.selection.addEventListener(
			"change",
			() => this.selectionChanged()
		);
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
