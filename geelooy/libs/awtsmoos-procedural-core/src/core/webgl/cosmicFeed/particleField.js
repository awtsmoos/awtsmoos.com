// B"H
// Boruch Hashem
// Blessed is He
/**
 * A field of many points remains one ordered revelation. The Awtsmoos renews
 * every particle; Awtsmoos.com lowers abundance before frame time becomes harm.
 */
import { createParticleLayout } from "./particleLayout.js";
import { createProgram, requiredUniform } from "./program.js";
import { PARTICLE_FRAGMENT_SHADER, PARTICLE_VERTEX_SHADER } from "./shaders/particles.js";

function createAttribute(gl, data, location, size) {
	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(location);
	gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
	return buffer;
}

/** Draws the deterministic GPU point field. */
export class ParticleField {
	constructor(gl, count) {
		this.gl = gl;
		this.program = createProgram(gl, PARTICLE_VERTEX_SHADER, PARTICLE_FRAGMENT_SHADER);
		this.uniforms = this.createUniforms();
		this.vertexArray = gl.createVertexArray();
		this.buffers = [];
		this.setCount(count);
	}

	createUniforms() {
		const gl = this.gl;
		const program = this.program;
		return {
			time: requiredUniform(gl, program, "uTime"),
			scroll: requiredUniform(gl, program, "uScroll"),
			scrollVelocity: requiredUniform(gl, program, "uScrollVelocity"),
			kineticEnergy: requiredUniform(gl, program, "uKineticEnergy"),
			pointer: requiredUniform(gl, program, "uPointer"),
			pointerVelocity: requiredUniform(gl, program, "uPointerVelocity"),
			interaction: requiredUniform(gl, program, "uInteraction"),
			interactionColor: requiredUniform(gl, program, "uInteractionColor"),
			feedBounds: requiredUniform(gl, program, "uFeedBounds"),
			motionScale: requiredUniform(gl, program, "uMotionScale")
		};
	}

	/** Rebuilds particle attributes for a changed profile. */
	setCount(count) {
		const gl = this.gl;
		this.count = Math.max(0, Math.floor(count));
		for (const buffer of this.buffers) {
			gl.deleteBuffer(buffer);
		}
		this.buffers = [];
		gl.bindVertexArray(this.vertexArray);
		const layout = createParticleLayout(this.count);
		this.buffers.push(createAttribute(gl, layout.positionPhase, 0, 4));
		this.buffers.push(createAttribute(gl, layout.motionFamily, 1, 4));
		this.buffers.push(createAttribute(gl, layout.color, 2, 3));
		gl.bindVertexArray(null);
	}

	/** Draws one particle frame with GPU-only motion. */
	draw(state) {
		const gl = this.gl;
		if (!this.count) {
			return;
		}
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		gl.useProgram(this.program);
		gl.bindVertexArray(this.vertexArray);
		gl.uniform1f(this.uniforms.time, state.time);
		gl.uniform1f(this.uniforms.scroll, state.scroll);
		gl.uniform1f(this.uniforms.scrollVelocity, state.scrollVelocity);
		gl.uniform1f(this.uniforms.kineticEnergy, state.kineticEnergy);
		gl.uniform2fv(this.uniforms.pointer, state.pointer);
		gl.uniform2fv(this.uniforms.pointerVelocity, state.pointerVelocity);
		gl.uniform4fv(this.uniforms.interaction, state.interaction);
		gl.uniform3fv(this.uniforms.interactionColor, state.interactionColor);
		gl.uniform2fv(this.uniforms.feedBounds, state.feedBounds);
		gl.uniform1f(this.uniforms.motionScale, state.motionScale);
		gl.drawArrays(gl.POINTS, 0, this.count);
		gl.bindVertexArray(null);
	}

	/** Releases GPU resources. */
	destroy() {
		for (const buffer of this.buffers) {
			this.gl.deleteBuffer(buffer);
		}
		this.gl.deleteVertexArray(this.vertexArray);
		this.gl.deleteProgram(this.program);
	}
}
