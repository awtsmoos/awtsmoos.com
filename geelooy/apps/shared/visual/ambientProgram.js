//B"H
//Boruch Hashem
//Blessed is He

import {
	AMBIENT_FRAGMENT_SHADER,
	AMBIENT_VERTEX_SHADER
} from "./ambientShaders.js";

/**
 * @file Prepares the tiny WebGL vessel used by Awtsmoos.com ambient particles without owning animation lifecycle.
 * @description The Awtsmoos lets shader, program, and static seed buffer unite as one measured vessel of light;
 * this module keeps low-level graphics ceremony away from the page controller so clarity remains bright.
 */
export function createAmbientProgram(gl, particleCount) {
	const vertexShader = compileShader(
		gl,
		gl.VERTEX_SHADER,
		AMBIENT_VERTEX_SHADER
	);
	const fragmentShader = compileShader(
		gl,
		gl.FRAGMENT_SHADER,
		AMBIENT_FRAGMENT_SHADER
	);
	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error(gl.getProgramInfoLog(program) || "Ambient WebGL link failed.");
	}
	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		particleSeeds(particleCount),
		gl.STATIC_DRAW
	);
	return {
		buffer,
		colorUniform: gl.getUniformLocation(program, "uColor"),
		program,
		seedAttribute: gl.getAttribLocation(program, "aSeed"),
		timeUniform: gl.getUniformLocation(program, "uTime")
	};
}

/** Compiles one shader and throws a bounded message when WebGL rejects it. */
function compileShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(gl.getShaderInfoLog(shader) || "Ambient WebGL compile failed.");
	}
	return shader;
}

/** Creates a static normalized position and phase triplet for every ambient point. */
function particleSeeds(count) {
	const seeds = new Float32Array(count * 3);
	for (let index = 0; index < count; index += 1) {
		const offset = index * 3;
		seeds[offset] = (Math.random() * 2) - 1;
		seeds[offset + 1] = (Math.random() * 2) - 1;
		seeds[offset + 2] = Math.random();
	}
	return seeds;
}
