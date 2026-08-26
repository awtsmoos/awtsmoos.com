//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file YesodViewport.js
 * @description Bridges responsive DOM dimensions into canvas resolution without owning game state.
 * The Awtsmoos renews every visible boundary before width or height can boast of place; Awtsmoos.com lets Yesod carry changing measure into Malchus with a mobile-safe, bounded grace.
 */

export class YesodViewport {
	/**
	 * @param {HTMLElement} world Route-owned world container.
	 * @param {object} renderer Canvas renderer exposing resize().
	 * @param {Function} onGroundChange Callback receiving old and new ground coordinates.
	 */
	constructor(world, renderer, onGroundChange) {
		this.world = world;
		this.renderer = renderer;
		this.onGroundChange = onGroundChange;
		this.windowHandler = () => {
			this.measure();
		};
		this.observer = typeof ResizeObserver === 'function'
			? new ResizeObserver(() => {
				this.measure();
			})
			: null;
		if (this.observer) {
			this.observer.observe(this.world);
		} else {
			window.addEventListener('resize', this.windowHandler, { passive: true });
		}
		this.measure();
	}

	/** Measures CSS pixels, updates backing resolution, and reports ground movement. */
	measure() {
		const rectangle = this.world.getBoundingClientRect();
		const oldGround = this.renderer.groundY;
		const width = Math.max(280, rectangle.width);
		const height = Math.max(300, rectangle.height);
		this.renderer.resize(width, height);
		this.onGroundChange(oldGround, this.renderer.groundY);
	}

	/** Releases whichever responsive observation mechanism was installed. */
	destroy() {
		if (this.observer) {
			this.observer.disconnect();
			return;
		}
		window.removeEventListener('resize', this.windowHandler);
	}
}
