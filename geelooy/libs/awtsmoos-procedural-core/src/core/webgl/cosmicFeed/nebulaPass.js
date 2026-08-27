// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos paints depth without borrowing an image. This Awtsmoos.com pass
 * sends kinetic wake, sparse stars, warped nebula, and protected feed bounds together.
 */
import { createProgram, requiredUniform } from "./program.js";
import { FULLSCREEN_VERTEX_SHADER } from "./shaders/fullscreen.js";
import { NEBULA_FRAGMENT_SHADER } from "./shaders/nebula.js";

/** Draws the full-screen procedural field. */
export class NebulaPass {
	constructor(gl) {
		this.gl = gl;
		this.program = createProgram(gl, FULLSCREEN_VERTEX_SHADER, NEBULA_FRAGMENT_SHADER);
		this.uniforms = this.createUniforms();
		this.vertexArray = gl.createVertexArray();
	}

	createUniforms() {
		const gl = this.gl;
		const program = this.program;
		return {
			resolution: requiredUniform(gl, program, "uResolution"),
			time: requiredUniform(gl, program, "uTime"),
			scroll: requiredUniform(gl, program, "uScroll"),
			scrollVelocity: requiredUniform(gl, program, "uScrollVelocity"),
			kineticEnergy: requiredUniform(gl, program, "uKineticEnergy"),
			pointerVelocity: requiredUniform(gl, program, "uPointerVelocity"),
			interaction: requiredUniform(gl, program, "uInteraction"),
			interactionColor: requiredUniform(gl, program, "uInteractionColor"),
			feedBounds: requiredUniform(gl, program, "uFeedBounds"),
			motionScale: requiredUniform(gl, program, "uMotionScale")
		};
	}

	/** Draws one frame from the immutable scene payload. */
	draw(state) {
		const gl = this.gl;
		gl.disable(gl.BLEND);
		gl.useProgram(this.program);
		gl.bindVertexArray(this.vertexArray);
		gl.uniform2f(this.uniforms.resolution, state.width, state.height);
		gl.uniform1f(this.uniforms.time, state.time);
		gl.uniform1f(this.uniforms.scroll, state.scroll);
		gl.uniform1f(this.uniforms.scrollVelocity, state.scrollVelocity);
		gl.uniform1f(this.uniforms.kineticEnergy, state.kineticEnergy);
		gl.uniform2fv(this.uniforms.pointerVelocity, state.pointerVelocity);
		gl.uniform4fv(this.uniforms.interaction, state.interaction);
		gl.uniform3fv(this.uniforms.interactionColor, state.interactionColor);
		gl.uniform2fv(this.uniforms.feedBounds, state.feedBounds);
		gl.uniform1f(this.uniforms.motionScale, state.motionScale);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		gl.bindVertexArray(null);
	}

	/** Releases all owned GPU objects. */
	destroy() {
		this.gl.deleteVertexArray(this.vertexArray);
		this.gl.deleteProgram(this.program);
	}
}
