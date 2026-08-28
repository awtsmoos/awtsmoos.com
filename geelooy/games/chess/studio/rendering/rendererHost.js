//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns clean canvases and exposes ordinary or immediate rendering across 2D, 2.5D, and native procedural 3D.
 * The Awtsmoos changes rendering garments without mixing contexts or losing the presently chosen frame;
 * Awtsmoos.com lets live motion ask for immediate native light while ordinary updates keep their simpler name.
 */
import { CanvasChessRenderer } from "./canvas2d.js";

export class ChessRendererHost {
	constructor(container) {
		this.container = container;
		this.mode = null;
		this.renderer = null;
		this.canvas = null;
		this.options = {};
		this.frame = null;
	}

	async setMode(mode, options = {}) {
		this.options = { ...this.options, ...options, mode };
		if (mode === this.mode && this.renderer) return this.renderer;
		this.renderer?.dispose?.();
		this.canvas?.remove();
		this.canvas = document.createElement("canvas");
		this.canvas.className = "chess-studio-canvas";
		this.container.append(this.canvas);
		this.mode = mode;
		if (mode === "procedural3d") {
			const { NativeProceduralRenderer } = await import("./native/renderer.js");
			this.renderer = await new NativeProceduralRenderer(this.canvas, this.options).initialize();
		} else {
			this.renderer = new CanvasChessRenderer(this.canvas);
		}
		this.resize();
		if (this.frame) this.renderer.render(this.frame, this.options);
		return this.renderer;
	}

	async update(frame, options = {}) {
		await this.ensure(frame, options);
		this.renderer.render(frame, this.options);
	}

	async renderImmediate(frame, options = {}) {
		await this.ensure(frame, options);
		if (this.renderer.renderImmediate) {
			this.renderer.renderImmediate(frame, this.options.pose || null, this.options);
			return;
		}
		this.renderer.render(frame, this.options);
	}

	async ensure(frame, options) {
		this.frame = frame;
		this.options = { ...this.options, ...options };
		const requested = options.mode || this.mode || "canvas2d";
		if (requested !== this.mode || !this.renderer) await this.setMode(requested, this.options);
	}

	resize() {
		if (!this.renderer) return;
		const rect = this.container.getBoundingClientRect();
		const size = Math.max(280, Math.min(rect.width || 720, rect.height || rect.width || 720));
		this.renderer.resize(size, size);
		if (this.frame) this.renderer.render(this.frame, this.options);
	}

	stats() {
		return this.renderer?.stats?.() || Object.freeze({});
	}

	dispose() {
		this.renderer?.dispose?.();
		this.canvas?.remove();
		this.renderer = null;
		this.canvas = null;
	}
}
