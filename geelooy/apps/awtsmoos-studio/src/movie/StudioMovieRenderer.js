//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioMovieRenderer.js
 * @description Keeps portable Canvas2D as full 2D/fallback rendering while Hybrid may request only transparent screen overlays above native WebGL depth.
 * The Awtsmoos renews depth and sign in one frame while Awtsmoos.com lets each vessel reveal only the light entrusted to its layer;
 * portable paint remains export-ready and complete, yet Hybrid clears its ground so the native world can shine beneath without a counterfeit player.
 * When the shared render graph finds photographs, the portable vessel becomes the photo compositor: plates, placed images, captions, and the declared cinematic grade.
 */

import { MovieLayerKind } from '../../../shared/movie/MovieKinds.js';
import { paintCharacterLayer } from '../../../shared/movie/runtime/CanvasCharacterPainter.js';
import { paintGraphicLayer } from '../../../shared/movie/runtime/CanvasGraphicPainter.js';
import { paintParticleLayer } from '../../../shared/movie/runtime/CanvasParticlePainter.js';
import { sampleMovieFrame } from '../../../shared/movie/runtime/MovieSceneSampler.js';
import { buildFramePlan } from '../../../shared/movie/render/RenderGraph.js';
import { PhotoCompositor } from '../../../shared/movie/runtime/PhotoCompositor.js';
import { applyCinematicGrade } from '../../../shared/movie/runtime/CinematicGrade.js';
import {
	movieImageSources,
	sharedPhotoImageCache
} from '../../../shared/movie/runtime/PhotoImageCache.js';
import { beginStudioLayerEffects, endStudioLayerEffects } from '../effects/StudioLayerEffectContext.js';
import { isStudioWorldLayer, studioLayerDepth } from '../spatial/StudioLayerDepth.js';
import { paintStudioProjectedLayer } from '../spatial/StudioProjectedLayerPainter.js';
import { isStudioThreeLayer, paintStudioThreeLayer } from './StudioThreeEntityRenderer.js';

/** Compose the portable frame, optionally restricting Canvas2D to screen-space overlays for Hybrid. */
export class StudioMovieRenderer {
	constructor(canvas) {
		if (!canvas?.getContext) throw new TypeError('StudioMovieRenderer requires a canvas element');
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.photoCompositor = null;
	}

	render(movie, time = 0, options = {}) {
		const viewport = this.prepareViewport(movie);
		const frame = sampleMovieFrame(movie, time);
		const overlayOnly = Boolean(options.overlayOnly);
		this.paintBackground(viewport, overlayOnly);
		if (!frame.scene) return frame;
		if (overlayOnly) {
			this.paintScreenLayers(frame, viewport);
			paintTransition(this.context, frame, viewport);
			return frame;
		}
		const plan = framePlanFor(movie, time);
		if (plan && isPhotographicFrame(plan, frame)) {
			this.compositor().paint(this.context, movie, plan, frame, viewport);
			paintTransition(this.context, frame, viewport);
			return frame;
		}
		this.paintFullFrame(frame, viewport);
		if (plan && movie?.render && plan.grade?.enabled) {
			applyCinematicGrade(this.context, viewport, plan.grade, plan.frameIndex);
		}
		paintTransition(this.context, frame, viewport);
		return frame;
	}

	compositor() {
		if (!this.photoCompositor) {
			this.photoCompositor = new PhotoCompositor({ imageCache: sharedPhotoImageCache });
		}
		return this.photoCompositor;
	}

	prepareViewport(movie) {
		const width = Number(movie?.format?.width || this.canvas.width || 1280);
		const height = Number(movie?.format?.height || this.canvas.height || 720);
		if (this.canvas.width !== width) this.canvas.width = width;
		if (this.canvas.height !== height) this.canvas.height = height;
		return { width, height };
	}

	paintBackground(viewport, overlayOnly) {
		this.context.clearRect(0, 0, viewport.width, viewport.height);
		if (overlayOnly) return;
		this.context.fillStyle = '#070b18';
		this.context.fillRect(0, 0, viewport.width, viewport.height);
	}

	paintFullFrame(frame, viewport) {
		const background = frame.layers.filter(layer => layer.kind === MovieLayerKind.WORLD_3D);
		const world = frame.layers.filter(layer => layer.kind !== MovieLayerKind.WORLD_3D && isStudioWorldLayer(layer));
		background.forEach(layer => this.paintWithEffects(layer, () => paintStudioThreeLayer(this.context, layer, frame, viewport)));
		world.sort((left, right) => studioLayerDepth(right, frame, viewport) - studioLayerDepth(left, frame, viewport));
		world.forEach(layer => this.paintWithEffects(layer, () => this.paintWorldLayer(layer, frame, viewport)));
		this.paintScreenLayers(frame, viewport);
	}

	paintScreenLayers(frame, viewport) {
		frame.layers
			.filter(layer => !isStudioWorldLayer(layer))
			.forEach(layer => this.paintWithEffects(layer, () => this.paintScreenLayer(layer, frame, viewport)));
	}

	paintWithEffects(layer, paint) {
		beginStudioLayerEffects(this.context, layer);
		try {
			paint();
		} finally {
			endStudioLayerEffects(this.context);
		}
	}

	paintWorldLayer(layer, frame, viewport) {
		if (isStudioThreeLayer(layer)) return paintStudioThreeLayer(this.context, layer, frame, viewport);
		paintStudioProjectedLayer(this.context, layer, frame, viewport);
	}

	paintScreenLayer(layer, frame, viewport) {
		paintGraphicLayer(this.context, layer, frame, viewport);
		paintParticleLayer(this.context, layer, frame, viewport);
		paintCharacterLayer(this.context, layer, frame, viewport);
	}
}

/** Build the shared frame plan defensively and warm the photo cache when a frame is photographic. */
function framePlanFor(movie, time) {
	try {
		const plan = buildFramePlan(movie, time);
		if (plan?.background?.kind === 'image') {
			void sharedPhotoImageCache.ensure(plan.background.src);
		}
		for (const source of movieImageSources(movie)) {
			void sharedPhotoImageCache.ensure(source);
		}
		return plan;
	} catch {
		return null;
	}
}

function isPhotographicFrame(plan, frame) {
	return plan.background?.kind === 'image' ||
		(frame.layers || []).some(layer => layer.kind === MovieLayerKind.IMAGE);
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
