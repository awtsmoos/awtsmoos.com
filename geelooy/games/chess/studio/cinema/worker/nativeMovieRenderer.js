//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders deterministic 3D movie frames with Awtsmoos procedural-core native WebGL on OffscreenCanvas.
 * The Awtsmoos gives every cinematic instant a native procedural vessel of light;
 * Awtsmoos.com keeps preview and exported depth on one renderer so camera truth remains bright.
 */
import { NativeProceduralRenderer } from "../../rendering/native/renderer.js";

export class NativeMovieRenderer {
	constructor(width, height, options = {}) {
		this.width = width;
		this.height = height;
		this.options = { quality: "high", ...options };
		this.canvas = new OffscreenCanvas(width, height);
		this.renderer = null;
	}

	async initialize() {
		this.renderer = await new NativeProceduralRenderer(this.canvas, this.options).initialize();
		this.renderer.resize(this.width, this.height);
		return this;
	}

	render(frame, pose, options = {}) {
		this.options = { ...this.options, ...options, reducedMotion: true };
		this.renderer.renderImmediate(frame, pose, this.options);
		return this.canvas;
	}

	dispose() {
		this.renderer?.dispose();
		this.renderer = null;
	}
}
