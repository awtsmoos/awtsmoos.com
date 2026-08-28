// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioCanvas.js
 * @description Coordinates semantic selection, snapped dragging, zoom, and painting while surface lifecycle and viewport geometry remain separate vessels.
 * The Awtsmoos recreates mover, moved, pointer, and screen each instant while remaining beyond their division;
 * Awtsmoos.com lets Netzach carry author motion through explicit helpers, keeping canvas mechanics from obscuring world intention.
 */

import { StudioCanvasGeometry } from './StudioCanvasGeometry.js';
import { StudioCanvasPainter } from './StudioCanvasPainter.js';
import { bindStudioCanvasSurface, createStudioCanvasSurface, resizeStudioCanvasSurface } from './StudioCanvasSurface.js';

export class StudioCanvas {
	/**
	 * @description Creates one top-down authoring canvas bound to canonical state, viewport geometry, painting, and responsive surface lifecycle.
	 * @param {HTMLElement} host Canvas host region.
	 * @param {StudioDocumentState} state Shared canonical Studio state.
	 */
	constructor(host, state) {
		this.host = host;
		this.state = state;
		this.draggingId = null;
		this.snapshot = state.snapshot();
		this.geometry = new StudioCanvasGeometry();
		this.canvas = createStudioCanvasSurface(host);
		this.painter = new StudioCanvasPainter(this.canvas, this.geometry);
		this.resizeObserver = bindStudioCanvasSurface(this.canvas, host, {
			beginDrag: event => this.beginDrag(event),
			drag: event => this.drag(event),
			endDrag: () => this.endDrag(),
			zoom: event => this.zoom(event),
			resize: () => this.render(this.snapshot)
		});
		this.ratio = resizeStudioCanvasSurface(this.canvas, this.host);
	}

	/**
	 * @description Stores the latest immutable snapshot, resizes the surface, paints the world, and exposes current zoom as data evidence.
	 * @param {object} snapshot Immutable Studio view snapshot.
	 * @returns {void} Updates canvas dimensions, pixels, and data-zoom only.
	 */
	render(snapshot) {
		this.snapshot = snapshot;
		this.ratio = resizeStudioCanvasSurface(this.canvas, this.host);
		this.painter.render(snapshot, this.ratio);
		this.canvas.dataset.zoom = this.geometry.zoom.toFixed(2);
	}

	/**
	 * @description Hit-tests a pointer-down event, selects the hit object, and begins pointer capture for dragging when appropriate.
	 * @param {PointerEvent} event Pointer-down event on the Studio canvas.
	 * @returns {void} Mutates selection, drag-session identity, and optional pointer capture.
	 */
	beginDrag(event) {
		const object = this.geometry.findObjectAt(event, this.canvas, this.snapshot.document.objects);
		this.draggingId = object?.id || null;
		this.state.select(this.draggingId);
		if (this.draggingId) {
			this.canvas.setPointerCapture?.(event.pointerId);
		}
	}

	/**
	 * @description Converts pointer motion into world coordinates and moves the actively dragged object through canonical state.
	 * @param {PointerEvent} event Pointer-move event on the Studio canvas.
	 * @returns {void} Mutates canonical object position only while a drag session is active.
	 */
	drag(event) {
		if (!this.draggingId) {
			return;
		}
		this.state.move(
			this.draggingId,
			this.geometry.eventToWorld(event, this.canvas)
		);
	}

	/**
	 * @description Ends the semantic drag session without changing current selection.
	 * @returns {void} Clears only local dragging identity.
	 */
	endDrag() {
		this.draggingId = null;
	}

	/**
	 * @description Applies bounded viewport zoom from wheel input and repaints the latest immutable snapshot.
	 * @param {WheelEvent} event Wheel event whose delta controls viewport zoom.
	 * @returns {void} Prevents default scrolling, mutates viewport zoom, and repaints.
	 */
	zoom(event) {
		event.preventDefault();
		this.geometry.zoomBy(event.deltaY);
		this.render(this.snapshot);
	}
}
