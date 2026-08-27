//B"H
//Boruch Hashem
//Blessed is He

import {
	clampColumnWidth,
	clampRowHeight
} from "../model/structureGeometry.js";
import {
	applyGridGeometry,
	visibleColumnWidth,
	visibleRowHeight
} from "./gridGeometry.js";

/**
 * @file Turns header-edge drags into smooth local geometry previews and one durable resize mutation.
 * @description The Awtsmoos lets the hand explore dimension freely before one final measure enters light;
 * Awtsmoos.com keeps pointer motion ephemeral and collaboration sparse, responsive, and right.
 */
export class NetzachGridResize {
	constructor(root, workbook, callbacks = {}) {
		this.root = root;
		this.workbook = workbook;
		this.callbacks = callbacks;
		this.drag = null;
	}

	/** Binds delegated pointer resize gestures without interfering with ordinary cell selection. */
	bind() {
		this.root.addEventListener(
			"pointerdown",
			(event) => this.begin(event),
			true
		);
		this.root.addEventListener("pointermove", (event) => this.move(event));
		this.root.addEventListener("pointerup", (event) => this.finish(event));
		this.root.addEventListener("pointercancel", () => this.cancel());
	}

	/** Begins one row or column resize and captures the pointer to its visible edge handle. */
	begin(event) {
		const handle = event.target.closest?.("[data-resize-axis]");
		if (!handle) {
			return;
		}
		event.preventDefault();
		event.stopImmediatePropagation();
		const axis = handle.dataset.resizeAxis;
		const index = Number(handle.dataset.resizeIndex);
		const startSize = axis === "column"
			? visibleColumnWidth(this.workbook.activeSheet, index)
			: visibleRowHeight(this.workbook.activeSheet, index);
		this.drag = {
			axis,
			handle,
			index,
			pointerId: event.pointerId,
			size: startSize,
			startPointer: axis === "column" ? event.clientX : event.clientY,
			startSize
		};
		handle.classList.add("is-resizing");
		handle.setPointerCapture?.(event.pointerId);
	}

	/** Previews one bounded grid track without touching workbook state or the realtime channel. */
	move(event) {
		if (!this.drag || event.pointerId !== this.drag.pointerId) {
			return;
		}
		const pointer = this.drag.axis === "column" ? event.clientX : event.clientY;
		const candidate = this.drag.startSize + pointer - this.drag.startPointer;
		this.drag.size = this.drag.axis === "column"
			? clampColumnWidth(candidate)
			: clampRowHeight(candidate);
		this.preview(this.drag);
	}

	/** Commits exactly one final resize mutation after the user releases the handle. */
	async finish(event) {
		if (!this.drag || event.pointerId !== this.drag.pointerId) {
			return;
		}
		const drag = this.release();
		if (drag.axis === "column") {
			await this.callbacks.onResizeColumn?.(drag.index, drag.size);
		} else {
			await this.callbacks.onResizeRow?.(drag.index, drag.size);
		}
	}

	/** Cancels the transient preview and restores persisted geometry. */
	cancel() {
		if (!this.drag) {
			return;
		}
		this.release();
		this.preview(null);
	}

	/** Clears pointer-capture visual state and returns the completed drag record. */
	release() {
		const drag = this.drag;
		drag.handle.classList.remove("is-resizing");
		drag.handle.releasePointerCapture?.(drag.pointerId);
		this.drag = null;
		return drag;
	}

	/** Applies persisted geometry plus one optional live override to the materialized grid. */
	preview(override) {
		const grid = this.root.querySelector(".sheet-grid");
		if (!grid) {
			return;
		}
		applyGridGeometry(
			grid,
			this.workbook.activeSheet,
			Number(grid.dataset.rows) || 80,
			Number(grid.dataset.columns) || 26,
			override
		);
	}
}
