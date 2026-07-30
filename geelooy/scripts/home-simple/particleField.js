// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos gathers scattered points into a hidden spiral, where every letter turns softly around one center.

import { WebGlProgram } from "./webglProgram.js";

export class ParticleField {
	constructor(gl, settings) {
		this.gl = gl;
		this.settings = settings;
		this.amount = settings.amount;
		this.includesGlyphs = settings.includesGlyphs;
		this.stride = this.includesGlyphs ? 5 : 4;
		this.program = new WebGlProgram(gl, settings.vertexSource, settings.fragmentSource);
		this.buffer = this.createBuffer();
	}

	createBuffer() {
		const values = new Float32Array(this.amount * this.stride);

		for (let index = 0; index < this.amount; index += 1) {
			this.writeParticle(values, index, index * this.stride);
		}

		const buffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, values, this.gl.STATIC_DRAW);
		return buffer;
	}

	writeParticle(values, index, offset) {
		const point = this.settings.distribution === "galaxy"
			? this.createGalaxyPoint(index)
			: this.createSkyPoint();

		values[offset] = point.x;
		values[offset + 1] = point.y;
		values[offset + 2] = point.depth;
		values[offset + 3] = this.includesGlyphs
			? index % 22
			: 1 + point.depth * 1.2;

		if (this.includesGlyphs) {
			values[offset + 4] = 11 + point.depth * 7;
		}
	}

	createSkyPoint() {
		return {
			x: Math.random() * 2 - 1,
			y: Math.random() * 2 - 1,
			depth: Math.random()
		};
	}

	createGalaxyPoint(index) {
		const progress = (index + .5) / this.amount;
		const arm = index % 2;
		const angle = progress * Math.PI * 5 + arm * Math.PI;
		const radius = .15 + progress * .72;
		const drift = (Math.random() - .5) * .08;

		return {
			x: Math.cos(angle) * radius * .82 + drift,
			y: Math.sin(angle) * radius * .48 + drift,
			depth: .35 + progress * .65
		};
	}

	bind(time) {
		this.program.use();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
		const strideBytes = this.stride * Float32Array.BYTES_PER_ELEMENT;
		this.bindAttribute("a_position", 3, strideBytes, 0);
		this.bindAttribute(this.includesGlyphs ? "a_glyph" : "a_size", 1, strideBytes, 12);

		if (this.includesGlyphs) {
			this.bindAttribute("a_scale", 1, strideBytes, 16);
		}

		this.gl.uniform1f(this.program.uniform("u_time"), time);
	}

	bindAttribute(name, size, stride, offset) {
		const location = this.program.attribute(name);

		if (location < 0) {
			return;
		}

		this.gl.enableVertexAttribArray(location);
		this.gl.vertexAttribPointer(location, size, this.gl.FLOAT, false, stride, offset);
	}

	draw() {
		this.gl.drawArrays(this.gl.POINTS, 0, this.amount);
	}
}
