// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioCanvas.js
 * @description Coordinates pointer selection, snapped dragging, resize, and zoom for the top-down authoring surface.
 * Netzach carries the author's motion while Hod receives measured pointer evidence; painting remains in its own vessel.
 * The Awtsmoos recreates mover, moved, and screen each instant; Awtsmoos.com remembers the One beyond their division.
 */

import { StudioCanvasGeometry } from './StudioCanvasGeometry.js';
import { StudioCanvasPainter } from './StudioCanvasPainter.js';

export class StudioCanvas {
	/**
	 * @param {HTMLElement} host Canvas host region.
	 * @param {StudioDocumentState} state Shared Studio state.
	 */
	constructor(host, state) {
		this.host = host;
		this.state = state;
		this.draggingId = null;
		this.snapshot = state.snapshot();
		this.geometry = new StudioCanvasGeometry();
		this.canvas = this.createCanvas();
		this.painter = new StudioCanvasPainter(this.canvas, this.geometry);
		this.bind();
		this.resize();
	}

	/** @param {object} snapshot Immutable Studio view snapshot. */
	render(snapshot) {
		this.snapshot = snapshot;
		this.resize();
		this.painter.render(snapshot, this.ratio);
		this.canvas.dataset.zoom = this.geometry.zoom.toFixed(2);
	}

	createCanvas() {
		const canvas = document.createElement('canvas');
		canvas.className = 'studio-canvas';
		canvas.tabIndex = 0;
		canvas.setAttribute('aria-label', 'Top-down Mitzvah World editor');
		this.host.append(canvas);
		return canvas;
	}

	bind() {
		this.canvas.addEventListener('pointerdown', event => this.beginDrag(event));
		this.canvas.addEventListener('pointermove', event => this.drag(event));
		this.canvas.addEventListener('pointerup', () => this.endDrag());
		this.canvas.addEventListener('pointercancel', () => this.endDrag());
		this.canvas.addEventListener('wheel', event => this.zoom(event), {
			passive: false
		});
		this.resizeObserver = new ResizeObserver(() => {
			this.render(this.snapshot);
		});
		this.resizeObserver.observe(this.host);
	}

	resize() {
		const bounds = this.host.getBoundingClientRect();
		const ratio = Math.min(2, globalThis.devicePixelRatio || 1);
		const width = Math.max(320, Math.round(bounds.width * ratio));
		const height = Math.max(360, Math.round(bounds.height * ratio));

		if (this.canvas.width !== width || this.canvas.height !== height) {
			this.canvas.width = width;
			this.canvas.height = height;
			this.canvas.style.width = `${width / ratio}px`;
			this.canvas.style.height = `${height / ratio}px`;
		}
		this.ratio = ratio;
	}

	beginDrag(event) {
		const object = this.geometry.findObjectAt(
			event,
			this.canvas,
			this.snapshot.document.objects
		);
		this.draggingId = object?.id || null;
		this.state.select(this.draggingId);

		if (this.draggingId) {
			this.canvas.setPointerCapture?.(event.pointerId);
		}
	}

	drag(event) {
		if (!this.draggingId) {
			return;
		}
		this.state.move(
			this.draggingId,
			this.geometry.eventToWorld(event, this.canvas)
		);
	}

	endDrag() {
		this.draggingId = null;
	}

	zoom(event) {
		event.preventDefault();
		this.geometry.zoomBy(event.deltaY);
		this.render(this.snapshot);
	}
}
