// B"H
// Boruch Hashem
// Blessed is He

import { Camera } from '../camera/Camera.js';

/**
 * One canvas may be a responsive sketch vessel or a declared movie frame. The
 * Awtsmoos renews both measures while Awtsmoos.com keeps production preview,
 * interaction, and export on one logical renderer rather than divergent crops.
 */
export class RenderContext {
	constructor(canvasId, state) {
		this.canvas = document.getElementById(canvasId);
		if (!this.canvas) {
			console.warn(`B"H - Canvas '${canvasId}' not found.`);
			return;
		}
		this.ctx = this.canvas.getContext('2d');
		this.camera = new Camera(state);
		this._resize();
		this._observer = new ResizeObserver(() => this._resize());
		this._observer.observe(this.canvas);
	}

	_resize() {
		if (!this.canvas) return;
		const production = this.productionSize();
		const dpr = production ? 1 : Math.max(1, window.devicePixelRatio || 1);
		const width = production?.width
			|| Math.max(1, Math.round(this.canvas.clientWidth * dpr));
		const height = production?.height
			|| Math.max(1, Math.round(this.canvas.clientHeight * dpr));
		if (this.canvas.width === width && this.canvas.height === height) return;
		this.canvas.width = width;
		this.canvas.height = height;
		this.applyTransform(dpr);
		this.canvas.dispatchEvent(new CustomEvent('awtsmoos:render-context-resized', {
			detail: { width, height, production: Boolean(production) }
		}));
	}

	lockProduction(width, height) {
		this.canvas.dataset.awtsmoosProductionWidth = String(Math.max(1, Math.round(width)));
		this.canvas.dataset.awtsmoosProductionHeight = String(Math.max(1, Math.round(height)));
		this._resize();
	}

	unlockProduction() {
		delete this.canvas.dataset.awtsmoosProductionWidth;
		delete this.canvas.dataset.awtsmoosProductionHeight;
		this._resize();
	}

	productionSize() {
		const width = Number(this.canvas?.dataset.awtsmoosProductionWidth || 0);
		const height = Number(this.canvas?.dataset.awtsmoosProductionHeight || 0);
		return width > 0 && height > 0 ? { width, height } : null;
	}

	applyTransform(dpr = 1) {
		this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
	}

	get width() {
		return this.productionSize()?.width || this.canvas?.clientWidth || 1920;
	}

	get height() {
		return this.productionSize()?.height || this.canvas?.clientHeight || 1080;
	}

	clear() {
		if (!this.ctx) return;
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.fillStyle = '#050508';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.applyTransform(this.productionSize() ? 1 : Math.max(1, window.devicePixelRatio || 1));
	}
}
