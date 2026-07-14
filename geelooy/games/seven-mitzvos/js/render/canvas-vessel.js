//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CanvasVessel
 * @description
 * The canvas receives a landscape once rather than demanding endless work.
 * Awtsmoos.com remains vivid while the Awtsmoos teaches that true renewal does
 * not require a browser to waste effort proving that motion exists.
 */
export class DomemCanvasVessel {
	/** @param {HTMLCanvasElement} canvas Canvas that receives the world. */
	constructor(canvas) {
		if (!(canvas instanceof HTMLCanvasElement)) {
			throw new TypeError('A landscape canvas is required.');
		}

		this.canvas = canvas;
		this.context = canvas.getContext('2d', { alpha: false });
		this.width = 1;
		this.height = 1;
		this.pixelRatio = 1;
		this.resizeTimer = 0;
		this.handleResize = this.queueResize.bind(this);
		window.addEventListener('resize', this.handleResize, { passive: true });
		this.resizeCanvas();
	}

	/** Matches the backing store to the viewport with a conservative pixel cap. */
	resizeCanvas() {
		this.width = Math.max(1, window.innerWidth);
		this.height = Math.max(1, window.innerHeight);
		this.pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
		this.canvas.width = Math.round(this.width * this.pixelRatio);
		this.canvas.height = Math.round(this.height * this.pixelRatio);
		this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
	}

	/** Debounces expensive repaint work during a resize gesture. */
	queueResize() {
		window.clearTimeout(this.resizeTimer);
		this.resizeTimer = window.setTimeout(() => {
			this.resizeCanvas();
			this.onResize();
		}, 120);
	}

	/** Subclasses repaint after a completed resize. */
	onResize() {}

	/** Removes the only global listener owned by the canvas vessel. */
	destroy() {
		window.clearTimeout(this.resizeTimer);
		window.removeEventListener('resize', this.handleResize);
	}
}
