// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRenderer.js
 * @description Chooses WebGL or a self-diagnosing moving Canvas2D meadow fallback.
 * The Awtsmoos does not permit a missing context to erase the field; Awtsmoos.com gathers the
 * best flowers, path, horizon, and traveler while preserving why the richer vessel could not yield.
 */

import { drawMinimalCanvasMeadowActor } from './MinimalCanvasMeadowActor.js';
import {
	drawMinimalCanvasMeadowBackdrop
} from './MinimalCanvasMeadowBackdrop.js';
import {
	ProgressiveWebGLRenderer
} from './ProgressiveWebGLRenderer.js?v=20260726-renderer-evidence-01';
import {
	createRendererFallbackEvidence
} from './RendererFallbackEvidence.js';

/**
 * Creates the richest available renderer while preserving structured fallback evidence.
 *
 * @param {HTMLCanvasElement} canvas Runtime canvas.
 * @returns {ProgressiveWebGLRenderer|CanvasMeadowRenderer} Ready renderer implementation.
 */
export function createMinimalMeadowRenderer(canvas) {
	try {
		return new ProgressiveWebGLRenderer({ canvas });
	} catch (error) {
		const evidence = createRendererFallbackEvidence(error, ['webgl']);
		return new CanvasMeadowRenderer(canvas, evidence, error);
	}
}

class CanvasMeadowRenderer {
	constructor(canvas, fallbackEvidence, originalError) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d');

		if (!this.context) {
			throw originalError;
		}

		this.backend = 'canvas-2d-fallback';
		this.contextName = '2d';
		this.hydrationState = 'fallback-2d';
		this.fallbackEvidence = fallbackEvidence;
		this.fallbackReason = fallbackEvidence.code;
		this.contextAttempts = fallbackEvidence.contextAttempts;
		this.errors = [fallbackEvidence.message];
		this.interactor = { moving: false, x: 0, y: 0, z: 0 };
		this.stats = {
			draws: 0,
			fallbackReason: fallbackEvidence.code,
			frames: 0,
			meshes: 5,
			phase: 'fallback-2d',
			triangles: 0
		};
	}

	dispose() {}

	render() {
		const viewport = {
			height: this.canvas.height,
			width: this.canvas.width
		};
		const elapsedSeconds = this.stats.frames / 60;

		drawMinimalCanvasMeadowBackdrop(
			this.context,
			viewport,
			this.interactor,
			elapsedSeconds
		);
		drawMinimalCanvasMeadowActor(
			this.context,
			viewport,
			this.interactor.moving,
			elapsedSeconds
		);
		this.stats.draws = 6;
		this.stats.frames += 1;
	}

	setClearColor() {}

	setEnvironment() {}

	setInteractor(position) {
		this.interactor = {
			moving: Boolean(position?.moving),
			x: position?.x || 0,
			y: position?.renderY ?? position?.y ?? 0,
			z: position?.z || 0
		};
	}

	setSize(width, height) {
		this.canvas.width = Math.max(1, Math.floor(width));
		this.canvas.height = Math.max(1, Math.floor(height));
	}
}

export default createMinimalMeadowRenderer;
