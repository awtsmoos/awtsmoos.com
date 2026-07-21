// B"H
// Boruch Hashem
// Blessed is He
/**
 * Sparse letters become constellations at the edge of attention. The Awtsmoos
 * renews them; Awtsmoos.com can remove their cost when the device asks mercy.
 */
import { createGlyphAtlas, HEBREW_GLYPHS } from "./glyphAtlas.js";
import { createProgram, requiredUniform } from "./program.js";
import { SeededRandom } from "./seededRandom.js";
import { GLYPH_FRAGMENT_SHADER, GLYPH_VERTEX_SHADER } from "./shaders/glyphs.js";

function bufferAttribute(gl, data, location, size, divisor = 0) {
	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(location);
	gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
	gl.vertexAttribDivisor(location, divisor);
	return buffer;
}

/** Draws a sparse instanced glyph constellation. */
export class GlyphField {
	/**
	 * @param {WebGL2RenderingContext} gl WebGL context.
	 * @param {number} count Glyph instance count.
	 */
	constructor(gl, count) {
		this.gl = gl;
		this.program = createProgram(gl, GLYPH_VERTEX_SHADER, GLYPH_FRAGMENT_SHADER);
		this.uniforms = {
			time: requiredUniform(gl, this.program, "uTime"),
			motionScale: requiredUniform(gl, this.program, "uMotionScale"),
			atlas: requiredUniform(gl, this.program, "uGlyphAtlas")
		};
		this.texture = createGlyphAtlas(gl);
		this.vertexArray = gl.createVertexArray();
		this.buffers = [];
		this.count = 0;
		this.setCount(count);
	}

	clearBuffers() {
		for (const buffer of this.buffers) {
			this.gl.deleteBuffer(buffer);
		}
		this.buffers = [];
	}

	/** Rebuilds the sparse field for a changed performance profile. */
	setCount(count) {
		this.count = Math.max(0, Math.floor(count));
		this.clearBuffers();
		if (!this.count) {
			return;
		}
		const random = new SeededRandom("intentional-hebrew-glyphs");
		const glyphs = new Float32Array(this.count * 4);
		const indices = new Float32Array(this.count);
		for (let index = 0; index < this.count; index += 1) {
			const offset = index * 4;
			const left = index % 2 === 0;
			glyphs[offset] = left ? random.range(-0.96, -0.55) : random.range(0.55, 0.96);
			glyphs[offset + 1] = random.range(-0.9, 0.9);
			glyphs[offset + 2] = random.range(0.025, 0.055);
			glyphs[offset + 3] = random.range(0, Math.PI * 2);
			indices[index] = index % HEBREW_GLYPHS.length;
		}
		const corners = new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5]);
		this.gl.bindVertexArray(this.vertexArray);
		this.buffers.push(bufferAttribute(this.gl, corners, 0, 2));
		this.buffers.push(bufferAttribute(this.gl, glyphs, 1, 4, 1));
		this.buffers.push(bufferAttribute(this.gl, indices, 2, 1, 1));
		this.gl.bindVertexArray(null);
	}

	/** Draws glyph instances when enabled. */
	draw(state) {
		if (!this.count) {
			return;
		}
		const gl = this.gl;
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		gl.useProgram(this.program);
		gl.bindVertexArray(this.vertexArray);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.uniform1i(this.uniforms.atlas, 0);
		gl.uniform1f(this.uniforms.time, state.time);
		gl.uniform1f(this.uniforms.motionScale, state.motionScale);
		gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.count);
		gl.bindVertexArray(null);
	}

	destroy() {
		this.clearBuffers();
		this.gl.deleteTexture(this.texture);
		this.gl.deleteVertexArray(this.vertexArray);
		this.gl.deleteProgram(this.program);
	}
}
