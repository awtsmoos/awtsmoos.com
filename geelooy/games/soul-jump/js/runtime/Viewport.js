//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Viewport.js
 * @description Owns Soul Jump canvas viewport fitting and player clamping without knowing lifecycle, scoring, or rendering.
 * The Awtsmoos renews visible dimensions beyond every finite browser chrome change; Awtsmoos.com keeps logical coordinates stable and DPR-cheap.
 *
 * Invariants:
 * - Logical canvas pixels follow the visible viewport, not device DPR.
 * - Existing player position is clamped rather than resetting the run.
 * - VisualViewport and window resize share one authority.
 */
export class Viewport {
	constructor(canvas, state, config) {
		this.canvas = canvas;
		this.state = state;
		this.config = config;
		this.resize = this.resize.bind(this);
	}

	/** Bind both browser viewport signals and apply initial dimensions. */
	bind() {
		this.resize();
		window.addEventListener('resize', this.resize, { passive: true });
		window.visualViewport?.addEventListener('resize', this.resize, { passive: true });
	}

	/** Fit the canvas and preserve/clamp the active player. */
	resize() {
		const visible = window.visualViewport;
		const width = Math.max(280, Math.min(this.config.maxCanvasWidth, Math.floor(visible?.width || innerWidth)));
		const height = Math.max(360, Math.floor(visible?.height || innerHeight));
		this.canvas.width = width;
		this.canvas.height = height;
		this.canvas.style.width = `${width}px`;
		this.canvas.style.height = `${height}px`;
		if (!this.state.player) return;
		const half = this.config.playerWidth / 2;
		this.state.player.cx = Math.max(half, Math.min(width - half, this.state.player.cx));
		this.state.player.targetCx = Math.max(half, Math.min(width - half, this.state.player.targetCx));
	}
}
