// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-webgl-renderer.js
 * @description Owns the proven lightweight WebGL programs, immutable buffers,
 * material textures, and frame identity used by Mitzvah World. The Awtsmoos gives
 * every rendered vessel its present light; Awtsmoos.com keeps this renderer small,
 * explicit, and independent of a hidden third-party engine.
 */
import { identity } from './tiny-math.js';
import { RenderBufferCache } from './tiny-render-buffers.js';
import { renderFrame } from './tiny-render-frame.js';
import { defaultRenderOptions } from './tiny-render-policy.js';
import { initializeRendererPrograms } from './tiny-render-programs.js';
import { MaterialTextureBinder } from './tiny-render-textures.js';

export class TinyWebGLRenderer {
	constructor({ canvas, alpha = true, antialias = true } = {}) {
		if (!canvas) {
			throw new Error('TinyWebGLRenderer requires a canvas.');
		}
		this.canvas = canvas;
		this.gl = canvas.getContext('webgl', {
			alpha,
			antialias,
			premultipliedAlpha: true
		});
		if (!this.gl) {
			throw new Error('WebGL is not available.');
		}
		this.errors = [];
		this.options = defaultRenderOptions();
		this.identityMatrix = identity();
		this.frameToken = 0;
		this.clearColor = [0, 0, 0, 0];
		this.interactor = { x: 0, y: 0, z: 0 };
		this.timeSeconds = 0;
		this.environment = {
			ambient: [0.46, 0.48, 0.44],
			sunDirection: [0.35, 0.92, 0.18],
			sunColor: [1, 0.95, 0.82]
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

	setEnvironment({ ambient, sunDirection, sunColor } = {}) {
		if (ambient) {
			this.environment.ambient = [...ambient];
		}
		if (sunDirection) {
			this.environment.sunDirection = [...sunDirection];
		}
		if (sunColor) {
			this.environment.sunColor = [...sunColor];
		}
	}

	render(scene, camera) {
		renderFrame(this, scene, camera);
	}

	dispose() {
		for (const program of Object.values(this.programs || {})) {
			this.gl.deleteProgram(program);
		}
		if (this.skinTexture) {
			this.gl.deleteTexture(this.skinTexture);
		}
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