//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioMovieRenderer.js
 * The Awtsmoos renews one present from dimensions that never stand apart;
 * Awtsmoos.com keeps proven 2D painters while real perspective reveals the 3D heart.
 */

import { sampleMovieFrame } from '../../../shared/movie/runtime/MovieSceneSampler.js';
import { paintGraphicLayer } from '../../../shared/movie/runtime/CanvasGraphicPainter.js';
import { paintCharacterLayer } from '../../../shared/movie/runtime/CanvasCharacterPainter.js';
import { paintParticleLayer } from '../../../shared/movie/runtime/CanvasParticlePainter.js';
import { isStudioThreeLayer, paintStudioThreeLayer } from './StudioThreeEntityRenderer.js';

/** Canvas renderer that composes canonical 2D semantics with true perspective 3D layers. */
export class StudioMovieRenderer {
	constructor(canvas) {
		if (!canvas?.getContext) throw new TypeError('StudioMovieRenderer requires a canvas element');
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
	}

	/** Render one canonical absolute movie time and return its sampled semantic frame. */
	render(movie, time = 0) {
		const width = Number(movie?.format?.width || this.canvas.width || 1280);
		const height = Number(movie?.format?.height || this.canvas.height || 720);
		if (this.canvas.width !== width) this.canvas.width = width;
		if (this.canvas.height !== height) this.canvas.height = height;
		const viewport = { width, height };
		const frame = sampleMovieFrame(movie, time);
		this.context.clearRect(0, 0, width, height);
		this.context.fillStyle = '#070b18';
		this.context.fillRect(0, 0, width, height);
		if (!frame.scene) return frame;
		for (const layer of frame.layers) this.paintLayer(layer, frame, viewport);
		paintTransition(this.context, frame, viewport);
		return frame;
	}

	paintLayer(layer, frame, viewport) {
		if (isStudioThreeLayer(layer)) {
			paintStudioThreeLayer(this.context, layer, frame, viewport);
			return;
		}
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
