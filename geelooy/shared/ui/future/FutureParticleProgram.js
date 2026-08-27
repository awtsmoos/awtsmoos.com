//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module FutureParticleProgram
 * @description
 * The Awtsmoos lets a handful of points hint at endless depth without turning the page into a game engine;
 * Awtsmoos.com keeps shader, buffer, draw, and destruction inside one small GPU vessel whose motion stays serene.
 */
const VERTEX_SHADER = `
attribute vec4 a_particle;
uniform float u_time;
uniform vec2 u_pointer;
varying float v_alpha;
void main() {
	float phase = a_particle.z * 6.2831853;
	vec2 drift = vec2(
		sin(u_time * 0.17 + phase),
		cos(u_time * 0.13 + phase * 1.21)
	) * 0.012;
	vec2 parallax = u_pointer * (0.004 + a_particle.z * 0.008);
	gl_Position = vec4(a_particle.xy + drift + parallax, 0.0, 1.0);
	gl_PointSize = a_particle.w;
	v_alpha = 0.18 + a_particle.z * 0.28;
}`;

const FRAGMENT_SHADER = `
precision mediump float;
uniform vec3 u_color;
varying float v_alpha;
void main() {
	vec2 center = gl_PointCoord - vec2(0.5);
	float radius = length(center);
	float soft = 1.0 - smoothstep(0.08, 0.5, radius);
	gl_FragColor = vec4(u_color, soft * v_alpha);
}`;

function compile(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const message = gl.getShaderInfoLog(shader) || 'Future particle shader failed.';
		gl.deleteShader(shader);
		throw new Error(message);
	}
	return shader;
}

function particleData(count, seed = 0x6d2b79f5) {
	let state = seed >>> 0;
	const next = () => {
		state = Math.imul(state ^ (state >>> 15), state | 1);
		state ^= state + Math.imul(state ^ (state >>> 7), state | 61);
		return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
	};
	const values = new Float32Array(count * 4);
	for (let index = 0; index < count; index += 1) {
		const offset = index * 4;
		values[offset] = next() * 2 - 1;
		values[offset + 1] = next() * 2 - 1;
		values[offset + 2] = next();
		values[offset + 3] = 2.2 + next() * 3.8;
	}
	return values;
}

export class FutureParticleProgram {
	constructor(gl, count) {
		this.gl = gl;
		this.count = count;
		const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
		const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
		this.program = gl.createProgram();
		gl.attachShader(this.program, vertex);
		gl.attachShader(this.program, fragment);
		gl.linkProgram(this.program);
		gl.deleteShader(vertex);
		gl.deleteShader(fragment);
		if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
			throw new Error(gl.getProgramInfoLog(this.program) || 'Future particle program failed.');
		}
		this.buffer = gl.createBuffer();
		this.position = gl.getAttribLocation(this.program, 'a_particle');
		this.time = gl.getUniformLocation(this.program, 'u_time');
		this.pointer = gl.getUniformLocation(this.program, 'u_pointer');
		this.color = gl.getUniformLocation(this.program, 'u_color');
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, particleData(count), gl.STATIC_DRAW);
	}

	draw(seconds, pointer, color) {
		const gl = this.gl;
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(this.program);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.enableVertexAttribArray(this.position);
		gl.vertexAttribPointer(this.position, 4, gl.FLOAT, false, 0, 0);
		gl.uniform1f(this.time, seconds);
		gl.uniform2f(this.pointer, pointer.x, pointer.y);
		gl.uniform3fv(this.color, color);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		gl.drawArrays(gl.POINTS, 0, this.count);
	}

	destroy() {
		this.gl.deleteBuffer(this.buffer);
		this.gl.deleteProgram(this.program);
	}
}

export { particleData };
