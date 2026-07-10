// B"H
import { identity } from './tiny-math.js';
import { RenderBufferCache } from './tiny-render-buffers.js';
import { renderFrame } from './tiny-render-frame.js';
import { defaultRenderOptions } from './tiny-render-policy.js';
import { initializeRendererPrograms } from './tiny-render-programs.js';
import { MaterialTextureBinder } from './tiny-render-textures.js';

/** Tiny renderer with textured terrain mixing and player-reactive yard grass. */
export class TinyWebGLRenderer {
	constructor({ canvas }) {
		this.canvas = canvas;
		this.gl = canvas.getContext('webgl', { antialias: true, alpha: true });
		if (!this.gl) throw new Error('WebGL unavailable');
		this.errors = [];
		this.options = defaultRenderOptions();
		this.identityMatrix = identity();
		this.interactor = { x: 0, y: 0, z: 0 };
		this.timeSeconds = 0;
		initializeRendererPrograms(this);
		this.buffers = new RenderBufferCache(this.gl);
		this.textures = new MaterialTextureBinder(this.gl);
	}

	setSize(width, height) {
		this.canvas.width = Math.max(1, width | 0);
		this.canvas.height = Math.max(1, height | 0);
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	}

	setInteractor(position, timeSeconds = performance.now() / 1000) {
		this.interactor = {
			x: position?.x || 0,
			y: position?.y || 0,
			z: position?.z || 0
		};
		this.timeSeconds = timeSeconds;
	}

	render(scene, camera) {
		renderFrame(this, scene, camera);
	}
}

export default TinyWebGLRenderer;
