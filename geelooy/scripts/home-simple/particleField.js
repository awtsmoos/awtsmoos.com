// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos gathers a deterministic constellation into one GPU buffer, then binds time, depth, attention, and motion without waste.

import { WebGlProgram } from "./webglProgram.js";

export class ParticleField {
	constructor(gl, settings) {
		this.gl = gl;
		this.attributes = settings.attributes;
		this.stride = settings.stride;
		this.amount = settings.data.length / this.stride;
		this.program = new WebGlProgram(gl, settings.vertexSource, settings.fragmentSource);
		this.buffer = this.createBuffer(settings.data);
	}

	createBuffer(data) {
		const buffer = this.gl.createBuffer();

		if (!buffer) {
			throw new Error("WebGL could not create a particle buffer.");
		}

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
		return buffer;
	}

	bind(frameState) {
		this.program.use();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
		this.bindAttributes();
		this.setUniform1f("u_time", frameState.time);
		this.setUniform1f("u_aspect", frameState.aspect);
		this.setUniform1f("u_dpr", frameState.dpr);
		this.setUniform1f("u_scroll", frameState.scroll);
		this.setUniform1f("u_pointer_strength", frameState.pointerStrength);
		this.setUniform2f("u_pointer", frameState.pointerX, frameState.pointerY);
		this.setUniform2f(
			"u_pointer_velocity",
			frameState.pointerVelocityX,
			frameState.pointerVelocityY
		);
	}

	bindAttributes() {
		const strideBytes = this.stride * Float32Array.BYTES_PER_ELEMENT;

		this.attributes.forEach(attribute => {
			const location = this.program.attribute(attribute.name);

			if (location < 0) {
				return;
			}

			this.gl.enableVertexAttribArray(location);
			this.gl.vertexAttribPointer(
				location,
				attribute.size,
				this.gl.FLOAT,
				false,
				strideBytes,
				attribute.offset * Float32Array.BYTES_PER_ELEMENT
			);
		});
	}

	setUniform1f(name, value) {
		const location = this.program.uniform(name);

		if (location !== null) {
			this.gl.uniform1f(location, value);
		}
	}

	setUniform2f(name, firstValue, secondValue) {
		const location = this.program.uniform(name);

		if (location !== null) {
			this.gl.uniform2f(location, firstValue, secondValue);
		}
	}

	draw() {
		this.gl.drawArrays(this.gl.POINTS, 0, this.amount);
	}

	dispose() {
		this.gl.deleteBuffer(this.buffer);
		this.program.dispose();
	}
}
