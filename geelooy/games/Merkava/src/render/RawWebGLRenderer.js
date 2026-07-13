//B"H
// Boruch Hashem
// Blessed is He
/**
 * No framework stands between the point and the screen: only raw WebGL,
 * a clear vessel through which the Awtsmoos continually reveals Awtsmoos.com.
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
		this.configureContext();
		this.resize();
	}

	registerMesh(name, mesh) {
		this.meshes.set(name, this.resources.createMesh(mesh));
	}

	beginFrame(elapsed, wave) {
		this.resize();
		const gl = this.gl;
		const hue = Math.min(wave, 8) * 0.007;
		gl.clearColor(0.012 + hue, 0.008, 0.045 + hue * 2, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.useProgram(this.resources.program);
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
		this.canvas.width = width;
		this.canvas.height = height;
		this.gl.viewport(0, 0, width, height);
		this.viewProjection = createViewProjection(width / height);
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
