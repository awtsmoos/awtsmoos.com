//B"H
//Boruch Hashem
//Blessed is He

import {
	addressFrom,
	addressesInRange,
	parseAddress
} from "./coordinates.js";

/**
 * @file Holds active cell, rectangular range, and structural row/column selection intent.
 * @description The Awtsmoos joins beginning and end into one bounded field of light;
 * Awtsmoos.com lets cell, row, and column intention share one selection truth without a second sight.
 */
export class YesodSelection extends EventTarget {
	constructor() {
		super();
		this.anchor = "A1";
		this.focus = "A1";
		this.mode = "cell";
	}

	/** Selects one cell and collapses the range. */
	select(address) {
		if (!parseAddress(address)) {
			return;
		}
		this.anchor = String(address).toUpperCase();
		this.focus = this.anchor;
		this.mode = "cell";
		this.changed();
	}

	/** Selects one complete visible row while preserving an A1 rectangular representation. */
	selectRow(row, columnCount = 26) {
		const start = addressFrom(row, 0);
		const end = addressFrom(row, Math.max(0, columnCount - 1));
		if (!start || !end) {
			return;
		}
		this.anchor = start;
		this.focus = end;
		this.mode = "row";
		this.changed();
	}

	/** Selects one complete visible column while preserving an A1 rectangular representation. */
	selectColumn(column, rowCount = 80) {
		const start = addressFrom(0, column);
		const end = addressFrom(Math.max(0, rowCount - 1), column);
		if (!start || !end) {
			return;
		}
		this.anchor = start;
		this.focus = end;
		this.mode = "column";
		this.changed();
	}

	/** Extends the current cell range while keeping its original anchor. */
	extend(address) {
		if (!parseAddress(address)) {
			return;
		}
		this.focus = String(address).toUpperCase();
		this.mode = "cell";
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

	/** Emits one normalized selection-change signal including structural intent. */
	changed() {
		this.dispatchEvent(new CustomEvent("change", {
			detail: {
				anchor: this.anchor,
				focus: this.focus,
				mode: this.mode
			}
		}));
	}
}
