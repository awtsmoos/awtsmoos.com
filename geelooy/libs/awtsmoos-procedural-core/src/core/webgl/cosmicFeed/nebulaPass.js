// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos paints depth without borrowing an image. This Awtsmoos.com
 * pass combines sparse stars, warped nebula, and a protected reading column.
 */

import { createProgram, requiredUniform } from "./program.js";
import { FULLSCREEN_VERTEX_SHADER } from "./shaders/fullscreen.js";
import { NEBULA_FRAGMENT_SHADER } from "./shaders/nebula.js";

/**
 * Draws the full-screen procedural field.
 */
export class NebulaPass {
	/**
	 * @param {WebGL2RenderingContext} gl WebGL context.
	 */
	constructor(gl) {
		this.gl = gl;
		this.program = createProgram(gl, FULLSCREEN_VERTEX_SHADER, NEBULA_FRAGMENT_SHADER);
		this.uniforms = {
			resolution: requiredUniform(gl, this.program, "uResolution"),
			time: requiredUniform(gl, this.program, "uTime"),
			scroll: requiredUniform(gl, this.program, "uScroll"),
			interaction: requiredUniform(gl, this.program, "uInteraction"),
			interactionColor: requiredUniform(gl, this.program, "uInteractionColor"),
			feedBounds: requiredUniform(gl, this.program, "uFeedBounds"),
			motionScale: requiredUniform(gl, this.program, "uMotionScale")
		};
		this.vertexArray = gl.createVertexArray();
	}

	/**
	 * Draws one frame.
	 * @param {Record<string, unknown>} state Shared scene state.
	 */
	draw(state) {
		const gl = this.gl;
		gl.disable(gl.BLEND);
		gl.useProgram(this.program);
		gl.bindVertexArray(this.vertexArray);
		gl.uniform2f(this.uniforms.resolution, state.width, state.height);
		gl.uniform1f(this.uniforms.time, state.time);
		gl.uniform1f(this.uniforms.scroll, state.scroll);
		gl.uniform4fv(this.uniforms.interaction, state.interaction);
		gl.uniform3fv(this.uniforms.interactionColor, state.interactionColor);
		gl.uniform2fv(this.uniforms.feedBounds, state.feedBounds);
		gl.uniform1f(this.uniforms.motionScale, state.motionScale);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		gl.bindVertexArray(null);
	}

	/**
	 * Releases GPU resources.
	 */
	destroy() {
		this.gl.deleteVertexArray(this.vertexArray);
		this.gl.deleteProgram(this.program);
	}
}
