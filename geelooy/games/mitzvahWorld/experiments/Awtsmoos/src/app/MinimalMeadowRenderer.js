// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRenderer.js
 * @description Chooses tiny WebGL and falls back to a visible canvas meadow when GPU access fails.
 * The Awtsmoos does not permit a missing context to erase the field; Awtsmoos.com reveals sky,
 * grass, hills, and traveler through the strongest finite drawing vessel the browser grants.
 */

import { ProgressiveWebGLRenderer } from './ProgressiveWebGLRenderer.js?v=20260723-meadow-02';

export function createMinimalMeadowRenderer(canvas) {
	try {
		return new ProgressiveWebGLRenderer({ canvas });
	} catch (error) {
		return new CanvasMeadowRenderer(canvas, error);
	}
}

class CanvasMeadowRenderer {
	constructor(canvas, webGlError) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		if (!this.context) throw webGlError;
		this.backend = 'canvas-2d-fallback';
		this.contextName = '2d';
		this.hydrationState = 'fallback-2d';
		this.errors = [webGlError?.message || String(webGlError)];
		this.interactor = { x: 0, y: 0, z: 0 };
		this.stats = { draws: 0, frames: 0, meshes: 5, phase: 'fallback-2d', triangles: 0 };
	}

	dispose() {}

	render() {
		const context = this.context;
		const width = this.canvas.width;
		const height = this.canvas.height;
		context.fillStyle = '#78abc7';
		context.fillRect(0, 0, width, height);
		drawHills(context, width, height);
		context.fillStyle = '#2f7f35';
		context.fillRect(0, height * 0.56, width, height * 0.44);
		drawTraveler(context, width / 2, height * 0.62);
		this.stats.draws = 5;
		this.stats.frames += 1;
	}

	setClearColor() {}

	setEnvironment() {}

	setInteractor(position) {
		this.interactor = {
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

function drawHills(context, width, height) {
	context.fillStyle = '#397e38';
	context.beginPath();
	context.ellipse(width * 0.2, height * 0.59, width * 0.27, height * 0.16, 0, 0, Math.PI * 2);
	context.ellipse(width * 0.78, height * 0.6, width * 0.34, height * 0.2, 0, 0, Math.PI * 2);
	context.fill();
}

function drawTraveler(context, x, y) {
	context.fillStyle = '#111b17';
	context.fillRect(x - 11, y - 42, 22, 42);
	context.beginPath();
	context.arc(x, y - 51, 11, 0, Math.PI * 2);
	context.fill();
	context.fillRect(x - 22, y - 66, 44, 6);
}

export default createMinimalMeadowRenderer;
