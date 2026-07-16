// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-webgl-renderer.js
 * @description Owns the lossless material-aware WebGL runtime and exact state vessels.
 * The Awtsmoos recreates the visible valley each instant; Awtsmoos.com allows only
 * proven-identical GPU declarations to rest while every animated form remains alive.
 */

import { identity } from './tiny-math.js';
import { installGlStateCache } from './tiny-gl-state-cache.js';
import { RenderBufferCache } from './tiny-render-buffers.js';
import { renderFrame } from './tiny-render-frame.js';
import { createInitialRendererStats } from './tiny-render-gl-state-stats.js';
import { RenderMaterialState } from './tiny-render-material-state.js';
import { defaultRenderOptions } from './tiny-render-policy.js';
import { initializeRendererPrograms } from './tiny-render-programs.js';
import { MaterialTextureBinder } from './tiny-render-textures.js';

export class TinyWebGLRenderer {
	constructor({ canvas, alpha = true, antialias = true } = {}) {
		if (!canvas) throw new Error('TinyWebGLRenderer requires a canvas.');
		this.canvas = canvas;
		this.gl = canvas.getContext('webgl', {
			alpha,
			antialias,
			premultipliedAlpha: true
		});
		if (!this.gl) throw new Error('WebGL is not available.');
		this.errors = [];
		this.glStateCache = installRendererStateCache(this);
		this.options = defaultRenderOptions();
		this.identityMatrix = identity();
		this.frameToken = 0;
		this.clearColor = [0.36, 0.56, 0.72, 1];
		this.interactor = { x: 0, y: 0, z: 0 };
		this.frameCameraPosition = { x: 0, y: 0, z: 0 };
		this.timeSeconds = 0;
		this.environment = defaultEnvironment();
		initializeRendererPrograms(this);
		this.buffers = new RenderBufferCache(this.gl, this.glStateCache);
		this.textures = new MaterialTextureBinder(this.gl);
		this.materialState = new RenderMaterialState();
		this.stats = createInitialRendererStats();
	}

	setSize(width, height) {
		this.canvas.width = Math.max(1, Math.floor(width));
		this.canvas.height = Math.max(1, Math.floor(height));
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	}

	setClearColor(red, green, blue, alpha = 1) {
		this.clearColor = [red, green, blue, alpha];
	}

	setInteractor(position, timeSeconds = performance.now() / 1000) {
		this.interactor = {
			x: position?.x || 0,
			y: position?.renderY ?? position?.y ?? 0,
			z: position?.z || 0
		};
		this.timeSeconds = timeSeconds;
	}

	setEnvironment(values = {}) {
		for (const key of ['ambient', 'sunDirection', 'sunColor', 'fogColor']) {
			if (values[key]) this.environment[key] = [...values[key]];
		}
		for (const key of ['fogNear', 'fogFar', 'exposure']) {
			if (Number.isFinite(values[key])) this.environment[key] = values[key];
		}
	}

	render(scene, camera) {
		renderFrame(this, scene, camera);
	}

	dispose() {
		this.buffers?.dispose?.();
		for (const program of new Set(Object.values(this.programs || {}))) {
			this.gl.deleteProgram(program);
		}
		if (this.skinTexture) this.gl.deleteTexture(this.skinTexture);
		this.glStateCache?.restore?.();
	}
}

function defaultEnvironment() {
	return {
		ambient: [0.20, 0.23, 0.25],
		sunDirection: [-0.42, 0.76, 0.49],
		sunColor: [1.26, 0.94, 0.68],
		fogColor: [0.52, 0.66, 0.72],
		fogNear: 145,
		fogFar: 560,
		exposure: 1.04
	};
}

function installRendererStateCache(renderer) {
	try {
		return installGlStateCache(renderer.gl);
	} catch (error) {
		renderer.errors.push(`WebGL state cache unavailable: ${error.message}`);
		return null;
	}
}

export default TinyWebGLRenderer;
