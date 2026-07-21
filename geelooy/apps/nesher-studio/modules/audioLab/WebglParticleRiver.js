/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos renews thousands of sparks without burdening layout or the main thread; Awtsmoos.com lets one transparent GPU field carry ten audio worlds.
*/
import { PARTICLE_FRAGMENT_SHADER, PARTICLE_VERTEX_SHADER } from './shaders.js';
import { createWebglProgram } from './webglProgram.js';

export class WebglParticleRiver {
	constructor(canvas) {
		this.canvas = canvas;
		this.gl = canvas.getContext('webgl2', {
			alpha: true,
			antialias: false,
			premultipliedAlpha: true,
			powerPreference: 'high-performance'
		});
		this.program = null;
		this.vertexArray = null;
		this.uniforms = {};
		this.error = '';
		this.aspect = 1;
		if (this.gl) this.initialize();
	}

	get available() {
		return Boolean(this.gl && this.program);
	}

	initialize() {
		try {
			this.program = createWebglProgram(this.gl, PARTICLE_VERTEX_SHADER, PARTICLE_FRAGMENT_SHADER);
			this.vertexArray = this.gl.createVertexArray();
			this.uniforms = this.readUniforms();
			this.gl.enable(this.gl.BLEND);
			this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
		} catch (error) {
			this.error = error.message;
			this.program = null;
		}
	}

	resize(width, height, pixelRatio) {
		const deviceWidth = Math.max(1, Math.round(width * pixelRatio));
		const deviceHeight = Math.max(1, Math.round(height * pixelRatio));
		this.aspect = width / Math.max(1, height);

		if (this.canvas.width !== deviceWidth || this.canvas.height !== deviceHeight) {
			this.canvas.width = deviceWidth;
			this.canvas.height = deviceHeight;
		}

		this.gl?.viewport(0, 0, deviceWidth, deviceHeight);
	}

	render(frame, configuration, timeSeconds, particleCount, quality) {
		if (!this.available) return false;
		const gl = this.gl;
		const preset = configuration.preset;
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(this.program);
		gl.bindVertexArray(this.vertexArray);
		this.setFloatUniforms(frame, configuration, timeSeconds, quality);
		gl.uniform1i(this.uniforms.mode, preset.mode);
		gl.uniform3fv(this.uniforms.primary, preset.primary);
		gl.uniform3fv(this.uniforms.secondary, preset.secondary);
		gl.drawArrays(gl.POINTS, 0, particleCount);
		gl.bindVertexArray(null);
		return true;
	}

	setFloatUniforms(frame, configuration, timeSeconds, quality) {
		const gl = this.gl;
		gl.uniform1f(this.uniforms.time, timeSeconds);
		gl.uniform1f(this.uniforms.flow, configuration.flow);
		gl.uniform1f(this.uniforms.bass, frame.bass);
		gl.uniform1f(this.uniforms.mid, frame.mid);
		gl.uniform1f(this.uniforms.treble, frame.treble);
		gl.uniform1f(this.uniforms.energy, frame.energy);
		gl.uniform1f(this.uniforms.pulse, frame.pulse);
		gl.uniform1f(this.uniforms.aspect, this.aspect);
		gl.uniform1f(this.uniforms.quality, quality);
	}

	readUniforms() {
		const names = ['time', 'flow', 'bass', 'mid', 'treble', 'energy', 'pulse', 'aspect', 'quality', 'mode', 'primary', 'secondary'];
		return Object.fromEntries(names.map((name) => [name, this.gl.getUniformLocation(this.program, `u_${name}`)]));
	}
}
