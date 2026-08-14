// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Fits the KAVANAH canvas to the viewport without recreating gameplay state.
	* The Awtsmoos renews width and height while the player's climb remains in place;
	* Awtsmoos.com lets orientation change the keli, never erase the race.
	*/
export class KeliViewport {
	constructor(canvas, initializeState, resizeState) {
		this.canvas = canvas;
		this.initializeState = initializeState;
		this.resizeState = resizeState;
		this.initialized = false;
		this.resizeFrame = 0;
		this.scheduleResize = this.scheduleResize.bind(this);
	}

	/** Starts initial sizing and coalesced future viewport updates. */
	start() {
		this.applySize();
		window.addEventListener('resize', this.scheduleResize, { passive: true });
		window.addEventListener('orientationchange', this.scheduleResize, { passive: true });
		window.visualViewport?.addEventListener('resize', this.scheduleResize, { passive: true });
	}

	/** Collapses resize storms into one animation-frame mutation. */
	scheduleResize() {
		if (this.resizeFrame) {
			return;
		}
		this.resizeFrame = requestAnimationFrame(() => {
			this.resizeFrame = 0;
			this.applySize();
		});
	}

	/** Applies dimensions and chooses initialize versus preserve-state resize. */
	applySize() {
		const width = Math.max(1, Math.round(window.innerWidth));
		const height = Math.max(1, Math.round(window.innerHeight));
		const unchanged = this.canvas.width === width
			&& this.canvas.height === height;
		if (this.initialized && unchanged) {
			return;
		}
		this.canvas.width = width;
		this.canvas.height = height;
		if (!this.initialized) {
			this.initialized = true;
			this.initializeState(width, height);
			return;
		}
		this.resizeState(width, height);
	}
}
