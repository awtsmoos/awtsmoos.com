// B"H
/** Owns the lightweight material-aware WebGL programs, immutable buffers, and frame identity. */
import { identity } from './tiny-math.js';
import { RenderBufferCache } from './tiny-render-buffers.js';
import { renderFrame } from './tiny-render-frame.js';
import { defaultRenderOptions } from './tiny-render-policy.js';
import { initializeRendererPrograms } from './tiny-render-programs.js';
import { MaterialTextureBinder } from './tiny-render-textures.js';

export class TinyWebGLRenderer {
	constructor({ canvas, alpha = true, antialias = true } = {}) {
		if (!canvas) throw new Error('TinyWebGLRenderer requires a canvas.');
		this.canvas = canvas;
		this.gl = canvas.getContext('webgl', { alpha, antialias, premultipliedAlpha: true });
		if (!this.gl) throw new Error('WebGL is not available.');
		this.errors = [];
		this.options = defaultRenderOptions();
		this.identityMatrix = identity();
		this.frameToken = 0;
		this.clearColor = [0.36, 0.56, 0.72, 1];
		this.interactor = { x: 0, y: 0, z: 0 };
		this.frameCameraPosition = { x: 0, y: 0, z: 0 };
		this.timeSeconds = 0;
		this.environment = {
			ambient: [0.20, 0.23, 0.25],
			sunDirection: [-0.42, 0.76, 0.49],
			sunColor: [1.26, 0.94, 0.68],
			fogColor: [0.52, 0.66, 0.72],
			fogNear: 145,
			fogFar: 560,
			exposure: 1.04
		};
		initializeRendererPrograms(this);
		this.buffers = new RenderBufferCache(this.gl);
		this.textures = new MaterialTextureBinder(this.gl);
		this.stats = createInitialStats();
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
		for (const program of Object.values(this.programs || {})) this.gl.deleteProgram(program);
		if (this.skinTexture) this.gl.deleteTexture(this.skinTexture);
	}
}

function createInitialStats() {
	return {
		draws: 0,
		triangles: 0,
		skinnedMeshes: 0,
		jointsUploaded: 0,
		skinPaletteRecomputes: 0,
		skinPaletteReuses: 0
	};
}

export default TinyWebGLRenderer;
