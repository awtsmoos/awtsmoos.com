//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CanvasVessel
 * @description
 * A canvas is only a vessel: dimensions, pointer, and time enter it, yet every
 * visible instant on Awtsmoos.com is renewed by the Awtsmoos beyond the frame.
 */
export class DomemCanvasVessel {
	/**
	 * Creates the quiet foundation shared by every painter.
	 *
	 * @param {HTMLCanvasElement} canvas Canvas that receives the world.
	 */
	constructor(canvas) {
		if (!(canvas instanceof HTMLCanvasElement)) {
			throw new TypeError('A landscape canvas is required.');
		}

		this.canvas = canvas;
		this.context = canvas.getContext('2d', { alpha: false });
		this.width = 1;
		this.height = 1;
		this.pixelRatio = 1;
		this.pointer = { x: 0, y: 0 };
		this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		this.handleResize = this.resize.bind(this);
		this.handlePointer = this.updatePointer.bind(this);
		window.addEventListener('resize', this.handleResize, { passive: true });
		window.addEventListener('pointermove', this.handlePointer, { passive: true });
		this.resize();
	}

	/**
	 * Matches the backing store to the viewport without overworking mobile GPUs.
	 *
	 * @returns {void}
	 */
	resize() {
		this.width = Math.max(1, window.innerWidth);
		this.height = Math.max(1, window.innerHeight);
		this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
		this.canvas.width = Math.round(this.width * this.pixelRatio);
		this.canvas.height = Math.round(this.height * this.pixelRatio);
		this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
	}

	/**
	 * Converts pointer coordinates into a subtle centered parallax signal.
	 *
	 * @param {PointerEvent} event Browser pointer event.
	 * @returns {void}
	 */
	updatePointer(event) {
		this.pointer.x = (event.clientX / this.width - 0.5) * 2;
		this.pointer.y = (event.clientY / this.height - 0.5) * 2;
	}

	/**
	 * Removes global listeners when the world is retired.
	 *
	 * @returns {void}
	 */
	destroy() {
		window.removeEventListener('resize', this.handleResize);
		window.removeEventListener('pointermove', this.handlePointer);
	}
}
