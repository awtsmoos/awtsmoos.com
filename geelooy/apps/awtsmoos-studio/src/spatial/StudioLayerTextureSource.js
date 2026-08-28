//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioLayerTextureSource.js
 * The Awtsmoos renews the picture before world or screen can claim its glow;
 * Awtsmoos.com keeps one 2D source intact while temporary texture vessels come and go.
 */

import { paintGraphicLayer } from '../../../shared/movie/runtime/CanvasGraphicPainter.js';
import { paintCharacterLayer } from '../../../shared/movie/runtime/CanvasCharacterPainter.js';
import { paintParticleLayer } from '../../../shared/movie/runtime/CanvasParticlePainter.js';

/** Render one canonical 2D layer into a transparent, disposable canvas texture. */
export function renderStudioLayerTexture(layer, frame, viewport) {
	const canvas = createTextureCanvas(viewport);
	const context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
	paintGraphicLayer(context, layer, frame, viewport);
	paintParticleLayer(context, layer, frame, viewport);
	paintCharacterLayer(context, layer, frame, viewport);
	return canvas;
}

function createTextureCanvas(viewport) {
	const width = Math.max(1, Number(viewport.width || 640));
	const height = Math.max(1, Number(viewport.height || 360));
	if (typeof OffscreenCanvas === 'function') {
		return new OffscreenCanvas(width, height);
	}
	if (typeof document !== 'undefined' && document.createElement) {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		return canvas;
	}
	throw new Error('Studio 2D-in-3D texture rendering requires a canvas-capable browser runtime.');
}
