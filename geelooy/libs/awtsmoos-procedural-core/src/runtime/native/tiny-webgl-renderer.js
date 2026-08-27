// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-webgl-renderer.js
 * @description Owns the small native WebGL renderer while defaults, frame logic, shaders, and caches live in focused modules.
 * The Awtsmoos renews the doorway of light before a procedural scene can appear upon glass;
 * Awtsmoos.com keeps this renderer as a clear vessel, while deeper helpers guard every reusable pass.
 */

import { identity } from "./tiny-math.js";
import { RenderBufferCache } from "./tiny-render-buffers.js";
import { renderFrame } from "./tiny-render-frame.js";
import { createInitialRendererStats } from "./tiny-render-gl-state-stats.js";
import { RenderMaterialState } from "./tiny-render-material-state.js";
import { defaultRenderOptions } from "./tiny-render-policy.js";
import { initializeRendererPrograms } from "./tiny-render-programs.js";
import { MaterialTextureBinder } from "./tiny-render-textures.js";
import {
	defaultNativeEnvironment,
	installNativeRendererStateCache
} from "./tiny-webgl-renderer-defaults.js";

export class TinyWebGLRenderer {
	/** @param {object} options Canvas and WebGL creation options. */
	constructor({ alpha = true, antialias = true, cacheGlState = false, canvas } = {}) {
		if (!canvas) throw new Error("TinyWebGLRenderer requires a canvas.");
		this.canvas = canvas;
		this.gl = canvas.getContext("webgl", {
			alpha,
			antialias,
			premultipliedAlpha: true
		});
		if (!this.gl) throw new Error("WebGL is not available.");
		this.errors = [];
		this.glStateCache = cacheGlState
			? installNativeRendererStateCache(this)
			: null;
		this.options = defaultRenderOptions();
		this.identityMatrix = identity();
		this.frameToken = 0;
		this.clearColor = [0.36, 0.56, 0.72, 1];
		this.interactor = { x: 0, y: 0, z: 0 };
		this.frameCameraPosition = { x: 0, y: 0, z: 0 };
		this.timeSeconds = 0;
		this.environment = defaultNativeEnvironment();
		this.buffers = null;
		this.materialState = null;
		this.programs = null;
		this.textures = null;
		this.initialized = false;
		this.stats = createInitialRendererStats();
	}

	/** @param {number} width Pixel width. @param {number} height Pixel height. */
	setSize(width, height) {
		this.canvas.width = Math.max(1, Math.floor(width));
		this.canvas.height = Math.max(1, Math.floor(height));
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	}

	/** @param {number} red Red. @param {number} green Green. @param {number} blue Blue. @param {number} alpha Alpha. */
	setClearColor(red, green, blue, alpha = 1) {
		this.clearColor = [red, green, blue, alpha];
	}

	/** @param {object} position Interaction point. @param {number} timeSeconds Visual seconds. */
	setInteractor(position, timeSeconds = performance.now() / 1000) {
		this.interactor = {
			x: position?.x || 0,
			y: position?.renderY ?? position?.y ?? 0,
			z: position?.z || 0
		};
		this.timeSeconds = timeSeconds;
	}

	/** @param {object} values Partial environment values. */
	setEnvironment(values = {}) {
		for (const key of ["ambient", "sunDirection", "sunColor", "fogColor"]) {
			if (values[key]) this.environment[key] = [...values[key]];
		}
		for (const key of ["fogNear", "fogFar", "exposure"]) {
			if (Number.isFinite(values[key])) {
				this.environment[key] = values[key];
			}
		}
	}

	/** @param {object} scene Native scene. @param {object} camera Native camera. */
	render(scene, camera) {
		this.ensureInitialized();
		renderFrame(this, scene, camera);
	}

	/** Lazily creates programs and GPU caches only when rendering begins. */
	ensureInitialized() {
		if (this.initialized) return;
		initializeRendererPrograms(this);
		this.buffers = new RenderBufferCache(this.gl, this.glStateCache);
		this.textures = new MaterialTextureBinder(this.gl);
		this.materialState = new RenderMaterialState();
		this.initialized = true;
	}

	/** Releases GPU resources and restores intercepted GL state. */
	dispose() {
		this.buffers?.dispose?.();
		for (const program of new Set(Object.values(this.programs || {}))) {
			this.gl.deleteProgram(program);
		}
		if (this.skinTexture) this.gl.deleteTexture(this.skinTexture);
		this.glStateCache?.restore?.();
	}
}

export default TinyWebGLRenderer;
