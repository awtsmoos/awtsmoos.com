//B"H
// Boruch Hashem
// Blessed is He
/**
 * No framework stands between the point and the screen: only raw WebGL,
 * a clear vessel through which the Awtsmoos continually reveals Awtsmoos.com.
 *
 * B"H — Yaakov 2026-10-13: the camera now chases the player's lane each
 * frame (see CameraProjection), and meshes may carry textures: draw() binds
 * a ready texture when one is registered, otherwise the flat vessel color.
 */
import { composeModel } from '../math/mat4.js';
import { createViewProjection } from './CameraProjection.js';
import { FRAGMENT_SHADER, VERTEX_SHADER } from './shaders.js';
import { WebGLResources } from './WebGLResources.js';

export class RawWebGLRenderer {
	constructor(canvas, onFatal) {
		this.canvas = canvas;
		this.onFatal = onFatal;
		this.gl = canvas.getContext('webgl', { antialias: true, alpha: false })
			|| canvas.getContext('experimental-webgl', { antialias: true, alpha: false });
		if (!this.gl) {
			throw new Error('Raw WebGL is unavailable in this browser.');
		}
		this.resources = new WebGLResources(this.gl, VERTEX_SHADER, FRAGMENT_SHADER);
		this.meshes = new Map();
		this.viewProjection = null;
		this.viewportWidth = 0;
		this.viewportHeight = 0;
		this.aspect = 1;
		this.configureContext();
		this.resize();
	}

	registerMesh(name, mesh) {
		this.meshes.set(name, this.resources.createMesh(mesh));
	}

	/**
	 * Begins loading a texture for a mesh. Loading is async and safe:
	 * draws fall back to flat color until the texture is ready, and a
	 * failed load simply keeps the flat color forever.
	 */
	setMeshTexture(name, url) {
		if (!url) {
			return;
		}
		this.resources.loadTexture(name, url);
	}

	beginFrame(elapsed, wave, playerX = 0) {
		this.resize();
		const gl = this.gl;
		const hue = Math.min(wave, 8) * 0.007;
		// B"H — Yaakov 2026-10-13: lifted void; the battlefield reads deep blue, not black.
		gl.clearColor(0.05 + hue, 0.045, 0.11 + hue * 2, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.useProgram(this.resources.program);
		this.viewProjection = createViewProjection(this.aspect, playerX);
		gl.uniformMatrix4fv(this.resources.locations.viewProjection, false, this.viewProjection);
		gl.uniform1f(this.resources.locations.pulse, elapsed);
	}

	draw(name, options = {}) {
		const mesh = this.meshes.get(name);
		if (!mesh) {
			return;
		}
		const gl = this.gl;
		const locations = this.resources.locations;
		const model = composeModel(
			options.position || [0, 0, 0],
			options.scale || [1, 1, 1],
			options.rotationY || 0
		);
		this.resources.bindMesh(mesh);
		gl.uniformMatrix4fv(locations.model, false, model);
		gl.uniform4fv(locations.tint, options.tint || [1, 1, 1, 1]);
		gl.uniform1f(locations.glow, options.glow || 0);
		const texture = this.resources.textureFor(name);
		if (texture) {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.uniform1i(locations.texture, 0);
			gl.uniform1f(locations.useTexture, 1);
		} else {
			gl.uniform1f(locations.useTexture, 0);
		}
		gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
	}

	resize() {
		const ratio = Math.min(window.devicePixelRatio || 1, 2);
		const width = Math.max(1, Math.floor(this.canvas.clientWidth * ratio));
		const height = Math.max(1, Math.floor(this.canvas.clientHeight * ratio));
		if (width === this.viewportWidth && height === this.viewportHeight) {
			return;
		}
		this.viewportWidth = width;
		this.viewportHeight = height;
		this.aspect = width / Math.max(height, 1);
		this.canvas.width = width;
		this.canvas.height = height;
		this.gl.viewport(0, 0, width, height);
	}

	configureContext() {
		const gl = this.gl;
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		this.canvas.addEventListener('webglcontextlost', event => {
			event.preventDefault();
			this.onFatal(new Error('The WebGL context was lost. Reload to renew the vessel.'));
		});
	}
}
