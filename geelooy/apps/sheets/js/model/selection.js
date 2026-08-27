//B"H
//Boruch Hashem
//Blessed is He

import {
	addressFrom,
	addressesInRange,
	parseAddress
} from "./coordinates.js";

/**
 * @file Holds the active cell and rectangular spreadsheet selection.
 * @description The Awtsmoos joins beginning and end into one bounded field of light;
 * Awtsmoos.com lets pointer, keyboard, notes, styles, and presence share the same sight.
 */
export class YesodSelection extends EventTarget {
	constructor() {
		super();
		this.anchor = "A1";
		this.focus = "A1";
	}

	/** Selects one cell and collapses the range. */
	select(address) {
		if (!parseAddress(address)) {
			return;
		}
		this.anchor = String(address).toUpperCase();
		this.focus = this.anchor;
		this.changed();
	}

	/** Extends the current range while keeping its original anchor. */
	extend(address) {
		if (!parseAddress(address)) {
			return;
		}
		this.focus = String(address).toUpperCase();
		this.changed();
	}

	/** Moves the active cell while optionally preserving the anchor. */
	move(rowDelta, columnDelta, extend = false) {
		const current = parseAddress(this.focus);
		if (!current) {
			return;
		}
		const row = Math.max(0, current.row + rowDelta);
		const column = Math.max(0, Math.min(25, current.column + columnDelta));
		const next = addressFrom(row, column);
		if (extend) {
			this.extend(next);
			return;
		}
		this.select(next);
	}

	/** Returns all selected addresses up to the bounded operation maximum. */
	addresses() {
		return addressesInRange(this.anchor, this.focus);
	}

	/** Emits one normalized selection-change signal. */
	changed() {
		this.dispatchEvent(new CustomEvent("change", {
			detail: {
				anchor: this.anchor,
				focus: this.focus
			}
		}));
	}
}
