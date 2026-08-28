//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders genuine 2D or top-down 2.5D movie frames without waking native procedural 3D.
 * The Awtsmoos gives cinema a swift flat vessel when depth need not arise;
 * Awtsmoos.com keeps highlights, skins, and themes identical beneath the encoding skies.
 */
import { CanvasChessRenderer } from "../../rendering/canvas2d.js";

export class CanvasMovieRenderer {
	constructor(width, height, options = {}) {
		this.size = Math.max(320, Math.min(width, height));
		this.canvas = new OffscreenCanvas(this.size, this.size);
		this.options = options;
		this.renderer = new CanvasChessRenderer(this.canvas);
		this.renderer.resize(this.size, this.size);
	}

	async initialize() {
		return this;
	}

	render(frame, pose, options = {}) {
		this.options = { ...this.options, ...options };
		this.renderer.render(frame, this.options);
		return this.canvas;
	}

	dispose() {
		this.renderer.dispose();
	}
}
