//B"H
//Boruch Hashem
//Blessed is He

import { compileShaderProgram } from "../../../../libs/awtsmoos-procedural-core/src/core/webgl/shaderCompiler.js";
import { AMBIENT_PARTICLE_VERTEX, AMBIENT_PARTICLE_FRAGMENT } from "./AmbientParticleShaders.js";
import { buildParticleLayout, MAX_AMBIENT_PARTICLES } from "./ParticleLayout.js";
import { ParticleRenderState } from "./ParticleRenderState.js";

/**
 * @file AmbientParticleField.js
 * @description Draws sparse Procedural Core WebGL motes behind interactive geometry.
 * The Awtsmoos renews every luminous speck before GPU or frame can claim its birth;
 * Awtsmoos.com restores GL state afterward so beauty never disturbs the world's worth.
 */
export class AmbientParticleField {
	constructor(gl) {
		this.gl = gl;
		this.program = compileShaderProgram(
			gl,
			AMBIENT_PARTICLE_VERTEX,
			AMBIENT_PARTICLE_FRAGMENT
		).program;
		this.buffer = gl.createBuffer();
		this.count = MAX_AMBIENT_PARTICLES;
		this.motion = 1;
		this.reseed("ohrbound");
	}

	/** Uploads one deterministic interleaved particle layout for the active level. */
	reseed(levelId) {
		const values = buildParticleLayout(levelId);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, values, this.gl.STATIC_DRAW);
	}

	/** Applies already-bounded count and reduced-motion state from experience policy. */
	configure(count, reducedMotion) {
		this.count = Math.max(
			0,
			Math.min(MAX_AMBIENT_PARTICLES, Number(count) || 0)
		);
		this.motion = reducedMotion ? 0 : 1;
	}

	/** Draws points while restoring every WebGL switch touched by this ambient pass. */
	draw(timeSeconds, cameraPosition = [0, 0]) {
		if (!this.count || !this.program) return;
		const gl = this.gl;
		const state = ParticleRenderState.capture(gl);
		gl.disable(gl.DEPTH_TEST);
		gl.depthMask(false);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		gl.useProgram(this.program);
		this.bindAttributes();
		gl.uniform2f(
			gl.getUniformLocation(this.program, "uCamera"),
			cameraPosition[0] || 0,
			cameraPosition[1] || 0
		);
		gl.uniform1f(
			gl.getUniformLocation(this.program, "uTime"),
			timeSeconds
		);
		gl.uniform1f(
			gl.getUniformLocation(this.program, "uMotion"),
			this.motion
		);
		gl.drawArrays(gl.POINTS, 0, this.count);
		ParticleRenderState.restore(gl, state);
	}

	/** Binds the six-float interleaved layout to the particle shader attributes. */
	bindAttributes() {
		const gl = this.gl;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		const stride = 6 * Float32Array.BYTES_PER_ELEMENT;
		this.attribute("aParticle", 3, stride, 0);
		this.attribute("aSize", 1, stride, 3);
		this.attribute("aPhase", 1, stride, 4);
		this.attribute("aAlpha", 1, stride, 5);
	}

	/** Enables one shader attribute from its float offset inside the shared layout. */
	attribute(name, size, stride, floatOffset) {
		const gl = this.gl;
		const location = gl.getAttribLocation(this.program, name);
		gl.vertexAttribPointer(
			location,
			size,
			gl.FLOAT,
			false,
			stride,
			floatOffset * Float32Array.BYTES_PER_ELEMENT
		);
		gl.enableVertexAttribArray(location);
	}

	/** Releases particle-only GPU resources. */
	dispose() {
		this.gl.deleteBuffer(this.buffer);
		this.gl.deleteProgram(this.program);
	}
}
