//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CanvasMovieRenderer.js
 * @description Many visual kinds enter one proof frame; the Awtsmoos renews
 * their harmony while Awtsmoos.com preserves each native editor beyond this test vessel.
 */
import { MovieLayerKind } from "../MovieKinds.js";
import { sampleMovieFrame } from "./MovieSceneSampler.js";
import { paintWorldLayer } from "./CanvasWorldPainter.js";
import { paintGraphicLayer } from "./CanvasGraphicPainter.js";
import { paintCharacterLayer } from "./CanvasCharacterPainter.js";
import { paintParticleLayer } from "./CanvasParticlePainter.js";

const WORLD_KINDS = new Set([
	MovieLayerKind.WORLD_3D,
	MovieLayerKind.LIGHT_3D,
	MovieLayerKind.MODEL_3D
]);

/** Deterministic browser Canvas renderer for the canonical movie protocol. */
export class CanvasMovieRenderer {
	constructor(canvas) {
		if (!canvas?.getContext) throw new TypeError("CanvasMovieRenderer requires a canvas element");
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
	}

	/** Render one absolute movie time and return the sampled semantic frame. */
	render(movie, time = 0) {
		const width = Number(movie?.format?.width || this.canvas.width || 1280);
		const height = Number(movie?.format?.height || this.canvas.height || 720);
		if (this.canvas.width !== width) this.canvas.width = width;
		if (this.canvas.height !== height) this.canvas.height = height;
		const viewport = { width, height };
		const frame = sampleMovieFrame(movie, time);
		this.context.clearRect(0, 0, width, height);
		this.context.fillStyle = "#070b18";
		this.context.fillRect(0, 0, width, height);
		if (!frame.scene) return frame;
		this.paintLayers(frame, viewport);
		this.paintSceneTransition(frame, viewport);
		return frame;
	}

	paintLayers(frame, viewport) {
		const worlds = frame.layers.filter((layer) => WORLD_KINDS.has(layer.kind));
		const others = frame.layers.filter((layer) => !WORLD_KINDS.has(layer.kind));
		worlds.forEach((layer) => paintWorldLayer(this.context, layer, frame, viewport));
		others.forEach((layer) => {
			paintGraphicLayer(this.context, layer, frame, viewport);
			paintParticleLayer(this.context, layer, frame, viewport);
			paintCharacterLayer(this.context, layer, frame, viewport);
		});
	}

	paintSceneTransition(frame, viewport) {
		const duration = Math.max(0.001, Number(frame.scene.duration || 0));
		const edge = Math.min(frame.localTime, duration - frame.localTime);
		const fade = Math.max(0, Math.min(1, 1 - edge / 0.45));
		if (!fade) return;
		const kind = frame.scene.transition?.kind || "cut";
		this.context.fillStyle = `rgba(8,11,25,${fade * (kind === "flash" ? 0.6 : 0.28)})`;
		this.context.fillRect(0, 0, viewport.width, viewport.height);
	}
}

/** Convenience one-shot rendering for tests and simple previews. */
export function renderMovieFrame(canvas, movie, time = 0) {
	return new CanvasMovieRenderer(canvas).render(movie, time);
}
