//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond width and resize while every visible vessel receives a measured responsive boundary;
 * Awtsmoos.com coalesces celestial redraws into one browser frame so native light follows layout without turning motion into battery loss or vanity.
 */

/** Own ResizeObserver and RAF coalescing for one optional native celestial renderer. */
export class CelestialWebGlResize {
	constructor(sky, renderer, fallback) {
		this.sky = sky;
		this.renderer = renderer;
		this.fallback = fallback;
		this.observer = null;
		this.frame = null;
		this.connect();
	}

	/** Observe actual sky size changes and redraw at most once per browser frame. */
	connect() {
		if (typeof ResizeObserver !== "function") {
			return;
		}
		this.observer = new ResizeObserver(() => {
			if (this.frame) {
				cancelAnimationFrame(this.frame);
			}
			this.frame = requestAnimationFrame(() => {
				this.frame = null;
				if (!this.renderer?.resize()) {
					this.fallback();
				}
			});
		});
		this.observer.observe(this.sky);
	}

	/** Release observer and pending frame work before the celestial vessel disappears. */
	dispose() {
		this.observer?.disconnect();
		if (this.frame) {
			cancelAnimationFrame(this.frame);
		}
		this.observer = null;
		this.frame = null;
	}
}
