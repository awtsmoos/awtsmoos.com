// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanvasSurface.js
 * @description Owns one DPR-aware, smoothly sampled production canvas surface.
 *
 * The Awtsmoos is one while the pixels are many. This vessel lets
 * Awtsmoos.com reveal finer physical detail without changing a single world
 * coordinate, collision footprint, portal, or saved position.
 */
import { resolveCanvasQuality } from './CanvasQualityProfile.js';
import { readCanvasViewport, setCanvasViewport } from './CanvasViewport.js';

export class CanvasSurface {
	/**
	 * @param {HTMLCanvasElement} canvas Existing production canvas.
	 * @param {{alpha?:boolean,environment?:Window}} options Surface options.
	 */
	constructor(canvas, options = {}) {
		if (!canvas) throw new Error('CanvasSurface requires an existing canvas.');
		this.canvas = canvas;
		this.environment = options.environment || globalThis;
		this.context = canvas.getContext('2d', { alpha: options.alpha !== false });
		if (!this.context) throw new Error(`Canvas context unavailable: ${canvas.id}`);
		this.quality = resolveCanvasQuality(this.environment);
	}

	/**
	 * Synchronizes CSS dimensions, physical backing pixels, and logical transform.
	 *
	 * @param {boolean} force Force context-state restoration.
	 * @returns {boolean} Whether backing dimensions changed.
	 */
	resize(force = false) {
		this.quality = resolveCanvasQuality(this.environment);
		const bounds = this.canvas.getBoundingClientRect();
		const width = logicalSize(bounds.width, this.canvas.clientWidth, 390);
		const height = logicalSize(bounds.height, this.canvas.clientHeight, 844);
		const ratio = this.quality.pixelRatio;
		const backingWidth = Math.max(1, Math.round(width * ratio));
		const backingHeight = Math.max(1, Math.round(height * ratio));
		const changed = this.canvas.width !== backingWidth || this.canvas.height !== backingHeight;
		if (changed) {
			this.canvas.width = backingWidth;
			this.canvas.height = backingHeight;
		}
		if (changed || force) this.restoreContext(width, height, ratio);
		return changed;
	}

	/** @returns {{width:number,height:number,pixelRatio:number,w:number,h:number}} */
	viewport() {
		return readCanvasViewport(this.context);
	}

	/** Clears the logical viewport beneath the DPR transform. */
	clear() {
		const viewport = this.viewport();
		this.context.clearRect(0, 0, viewport.width, viewport.height);
	}

	/** Snaps a CSS-space coordinate to one physical device pixel. */
	snap(value) {
		const ratio = this.viewport().pixelRatio;
		return Math.round(Number(value || 0) * ratio) / ratio;
	}

	restoreContext(width, height, pixelRatio) {
		this.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
		this.context.imageSmoothingEnabled = true;
		this.context.imageSmoothingQuality = 'high';
		setCanvasViewport(this.context, { width, height, pixelRatio });
	}
}

const logicalSize = (measured, client, fallback) => {
	const value = Number(measured) || Number(client) || Number(fallback);
	return Math.max(1, Math.round(value));
};
