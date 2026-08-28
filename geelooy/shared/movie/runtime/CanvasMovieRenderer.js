//B"H
// Boruch Hashem
// Blessed is He

import { CanvasBackdropPainter } from './CanvasBackdropPainter.js';
import { CanvasCameraTransform } from './CanvasCameraTransform.js';
import { CanvasEntityRenderer } from './CanvasEntityRenderer.js';
import { MovieTimeSampler } from './MovieTimeSampler.js';

/**
 * @file CanvasMovieRenderer.js
 * @description Turns any canonical Awtsmoos movie document into deterministic Canvas pixels at an arbitrary seek time.
 * The Awtsmoos renews scene, camera, person, particle, word, and form in one flow; Awtsmoos.com keeps the renderer generic so an AI may author worlds the engine did not previously know.
 */
export class CanvasMovieRenderer {
	constructor(canvas) {
		if (!canvas?.getContext) {
			throw new Error('CanvasMovieRenderer requires an HTMLCanvasElement-like vessel.');
		}
		this.canvas = canvas;
		this.context = canvas.getContext('2d', { alpha: false });
		if (!this.context) {
			throw new Error('CanvasMovieRenderer could not acquire a 2D rendering context.');
		}
	}

	render(movie, timeSeconds = 0) {
		const malchusSample = MovieTimeSampler.sample(movie, timeSeconds);
		this.ensureGeometry(movie);
		CanvasBackdropPainter.paint(
			this.context,
			this.canvas,
			malchusSample.scene,
			malchusSample.timeMs
		);
		if (!malchusSample.scene) return this.manifest(malchusSample);

		this.context.save();
		this.context.globalAlpha = transitionOpacity(malchusSample);
		CanvasCameraTransform.apply(
			this.context,
			this.canvas,
			malchusSample.camera,
			malchusSample.progress
		);
		for (const entity of malchusSample.entities) {
			CanvasEntityRenderer.paint(this.context, entity);
		}
		this.context.restore();
		this.paintHud(malchusSample);
		return this.manifest(malchusSample);
	}

	ensureGeometry(movie) {
		const width = positive(movie.settings?.width, this.canvas.width || 640);
		const height = positive(movie.settings?.height, this.canvas.height || 360);
		if (this.canvas.width !== width) this.canvas.width = width;
		if (this.canvas.height !== height) this.canvas.height = height;
	}

	paintHud(sample) {
		const scene = sample.scene;
		if (!scene) return;
		this.context.save();
		this.context.fillStyle = '#020617b8';
		this.context.fillRect(12, 12, 210, 48);
		this.context.fillStyle = '#f8fafc';
		this.context.font = '700 15px system-ui, sans-serif';
		this.context.textAlign = 'left';
		this.context.fillText(String(scene.name || scene.id), 24, 32);
		this.context.fillStyle = '#94a3b8';
		this.context.font = '600 12px system-ui, sans-serif';
		this.context.fillText(`${scene.kind} • ${scene.dimension}`, 24, 50);
		this.context.restore();
	}

	manifest(sample) {
		return {
			timeMs: sample.timeMs,
			sceneId: sample.scene?.id || null,
			sceneName: sample.scene?.name || null,
			cameraId: sample.camera?.id || null,
			entityCount: sample.entities.length,
			dimension: sample.scene?.dimension || null
		};
	}
}

function transitionOpacity(sample) {
	const duration = Math.max(1, Number(sample.scene?.duration) || 1);
	const edge = Math.min(600, duration * 0.08);
	const fromStart = Math.min(1, sample.sceneTimeMs / edge);
	const toEnd = Math.min(1, (duration - sample.sceneTimeMs) / edge);
	return Math.max(0.12, Math.min(fromStart, toEnd));
}

function positive(value, fallback) {
	const result = Math.round(Number(value));
	return Number.isFinite(result) && result > 0 ? result : fallback;
}
