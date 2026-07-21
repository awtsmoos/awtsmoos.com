/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos sustains the luminous river through loss and restoration of its vessel; Awtsmoos.com coordinates recovery, dimensions, uniforms, and drawing without layout work.
*/
import { PARTICLE_FRAGMENT_SHADER, PARTICLE_VERTEX_SHADER } from './shaders.js';
import { createWebglProgram } from './webglProgram.js';
import {
	configureParticleState,
	createParticleContext,
	readParticleUniforms,
	releaseParticleResources
} from './webglParticleState.js';
export class WebglParticleRiver {
	constructor(canvas) {
		this.canvas = canvas;
		this.gl = createParticleContext(canvas);
		this.program = null;
		this.vertexArray = null;
		this.uniforms = {};
		this.error = '';
		this.aspect = 1;
		this.contextLost = false;
		this.onContextLost = (event) => this.handleContextLost(event);
		this.onContextRestored = () => this.handleContextRestored();
		canvas.addEventListener('webglcontextlost', this.onContextLost, false);
		canvas.addEventListener('webglcontextrestored', this.onContextRestored, false);
		if (this.gl) this.initialize();
	}
	get available() {
		return Boolean(this.gl && this.program && !this.contextLost);
	}
	initialize() {
		if (!this.gl) return;
		this.releaseResources();
		try {
			this.program = createWebglProgram(
				this.gl,
				PARTICLE_VERTEX_SHADER,
				PARTICLE_FRAGMENT_SHADER
			);
			this.vertexArray = this.gl.createVertexArray();
			this.uniforms = readParticleUniforms(this.gl, this.program);
			configureParticleState(this.gl);
			this.contextLost = false;
			this.error = '';
		} catch (error) {
			this.error = error instanceof Error ? error.message : String(error);
			this.releaseResources();
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
		const values = {
			time: timeSeconds,
			flow: configuration.flow,
			bass: frame.bass,
			mid: frame.mid,
			treble: frame.treble,
			energy: frame.energy,
			pulse: frame.pulse,
			aspect: this.aspect,
			quality
		};
		Object.entries(values).forEach(([name, value]) => {
			this.gl.uniform1f(this.uniforms[name], value);
		});
	}
	handleContextLost(event) {
		event.preventDefault();
		this.contextLost = true;
		this.error = 'WebGL context temporarily lost.';
		this.program = null;
		this.vertexArray = null;
		this.uniforms = {};
	}
	handleContextRestored() {
		this.initialize();
		this.gl?.viewport(0, 0, this.canvas.width, this.canvas.height);
	}
	releaseResources() {
		releaseParticleResources(this.gl, this, this.contextLost);
		this.vertexArray = null;
		this.program = null;
		this.uniforms = {};
	}
}
