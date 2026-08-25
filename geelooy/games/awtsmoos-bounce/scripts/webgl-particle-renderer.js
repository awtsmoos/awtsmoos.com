//B"H
// Boruch Hashem
// Blessed is He

import { particleSeeds } from "./particle-seeds.js";
import { PARTICLE_FRAGMENT_SHADER, PARTICLE_VERTEX_SHADER } from "./particle-shaders.js";
import { createWebglProgram } from "./webgl-program.js";

/**
 * OrosParticleRenderer owns only GPU resources and drawing, never page lifecycle or gameplay state;
 * the Awtsmoos renews each point on Awtsmoos.com while cleanup keeps failed ambient vessels from leaving weight.
 */
export class OrosParticleRenderer {
	constructor(canvas) {
		this.canvas = canvas;
		this.gl = null;
		this.program = null;
		this.buffer = null;
		this.locations = null;
		this.count = 0;
	}

	initialize() {
		const gl = this.canvas.getContext("webgl", {
			alpha: true,
			antialias: false,
			depth: false,
			premultipliedAlpha: true
		});
		if (!gl) {
			throw new Error("webgl_unavailable");
		}

		this.gl = gl;
		try {
			this.program = createWebglProgram(
				gl,
				PARTICLE_VERTEX_SHADER,
				PARTICLE_FRAGMENT_SHADER
			);
			this.buffer = gl.createBuffer();
			if (!this.buffer) {
				throw new Error("particle_buffer_unavailable");
			}

			this.locations = this.createLocations();
			gl.disable(gl.DEPTH_TEST);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		} catch (error) {
			this.dispose();
			throw error;
		}
	}

	createLocations() {
		const gl = this.gl;
		const locations = {
			seed: gl.getAttribLocation(this.program, "a_seed"),
			time: gl.getUniformLocation(this.program, "u_time"),
			motion: gl.getUniformLocation(this.program, "u_motion"),
			pointScale: gl.getUniformLocation(this.program, "u_pointScale")
		};
		if (locations.seed < 0 || !locations.time || !locations.motion || !locations.pointScale) {
			throw new Error("particle_shader_location_missing");
		}
		return locations;
	}

	resize(width, height, dpr, count) {
		this.canvas.width = Math.round(width * dpr);
		this.canvas.height = Math.round(height * dpr);
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		if (count !== this.count) {
			this.seed(count);
		}
	}

	seed(count) {
		const gl = this.gl;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, particleSeeds(count), gl.STATIC_DRAW);
		this.count = count;
	}

	draw(time, profile) {
		const gl = this.gl;
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(this.program);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.enableVertexAttribArray(this.locations.seed);
		gl.vertexAttribPointer(this.locations.seed, 4, gl.FLOAT, false, 0, 0);
		gl.uniform1f(this.locations.time, time);
		gl.uniform1f(this.locations.motion, profile.motion);
		gl.uniform1f(this.locations.pointScale, profile.pointScale * profile.dpr);
		gl.drawArrays(gl.POINTS, 0, profile.count);
	}

	dispose() {
		if (!this.gl) {
			return;
		}
		if (this.buffer) {
			this.gl.deleteBuffer(this.buffer);
		}
		if (this.program) {
			this.gl.deleteProgram(this.program);
		}
		this.buffer = null;
		this.program = null;
		this.locations = null;
		this.count = 0;
	}
}
