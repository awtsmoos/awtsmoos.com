//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioMovieRenderer.js
 * The Awtsmoos renews screen and world while neither must swallow the other's art;
 * Awtsmoos.com lets reversible 2D planes share depth with true 3D, then keeps the HUD clear at the heart.
 */

import { MovieLayerKind } from '../../../shared/movie/MovieKinds.js';
import { sampleMovieFrame } from '../../../shared/movie/runtime/MovieSceneSampler.js';
import { paintGraphicLayer } from '../../../shared/movie/runtime/CanvasGraphicPainter.js';
import { paintCharacterLayer } from '../../../shared/movie/runtime/CanvasCharacterPainter.js';
import { paintParticleLayer } from '../../../shared/movie/runtime/CanvasParticlePainter.js';
import { isStudioThreeLayer, paintStudioThreeLayer } from './StudioThreeEntityRenderer.js';
import { isStudioWorldLayer, studioLayerDepth } from '../spatial/StudioLayerDepth.js';
import { paintStudioProjectedLayer } from '../spatial/StudioProjectedLayerPainter.js';

/** Compose world background, depth-ordered 3D/spatial layers, then ordinary screen-space 2D. */
export class StudioMovieRenderer {
	constructor(canvas) {
		if (!canvas?.getContext) throw new TypeError('StudioMovieRenderer requires a canvas element');
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
	}

	/** Render one absolute canonical movie time and return the exact semantic frame sampled. */
	render(movie, time = 0) {
		const viewport = this.prepareViewport(movie);
		const frame = sampleMovieFrame(movie, time);
		this.paintBackground(viewport);
		if (!frame.scene) return frame;
		const background = frame.layers.filter((layer) => layer.kind === MovieLayerKind.WORLD_3D);
		const world = frame.layers.filter((layer) => layer.kind !== MovieLayerKind.WORLD_3D && isStudioWorldLayer(layer));
		const screen = frame.layers.filter((layer) => !isStudioWorldLayer(layer));
		background.forEach((layer) => paintStudioThreeLayer(this.context, layer, frame, viewport));
		world.sort((a, b) => studioLayerDepth(b, frame, viewport) - studioLayerDepth(a, frame, viewport));
		world.forEach((layer) => this.paintWorldLayer(layer, frame, viewport));
		screen.forEach((layer) => this.paintScreenLayer(layer, frame, viewport));
		paintTransition(this.context, frame, viewport);
		return frame;
	}

	prepareViewport(movie) {
		const width = Number(movie?.format?.width || this.canvas.width || 1280);
		const height = Number(movie?.format?.height || this.canvas.height || 720);
		if (this.canvas.width !== width) this.canvas.width = width;
		if (this.canvas.height !== height) this.canvas.height = height;
		return { width, height };
	}

	paintBackground(viewport) {
		this.context.clearRect(0, 0, viewport.width, viewport.height);
		this.context.fillStyle = '#070b18';
		this.context.fillRect(0, 0, viewport.width, viewport.height);
	}

	paintWorldLayer(layer, frame, viewport) {
		if (isStudioThreeLayer(layer)) {
			paintStudioThreeLayer(this.context, layer, frame, viewport);
			return;
		}
		paintStudioProjectedLayer(this.context, layer, frame, viewport);
	}

	paintScreenLayer(layer, frame, viewport) {
		paintGraphicLayer(this.context, layer, frame, viewport);
		paintParticleLayer(this.context, layer, frame, viewport);
		paintCharacterLayer(this.context, layer, frame, viewport);
	}
}

function paintTransition(context, frame, viewport) {
	const duration = Math.max(0.001, Number(frame.scene.duration || 0));
	const edge = Math.min(frame.localTime, duration - frame.localTime);
	const fade = Math.max(0, Math.min(1, 1 - edge / 0.45));
	if (!fade) return;
	const kind = frame.scene.transition?.kind || 'cut';
	context.fillStyle = `rgba(8,11,25,${fade * (kind === 'flash' ? 0.6 : 0.28)})`;
	context.fillRect(0, 0, viewport.width, viewport.height);
}
