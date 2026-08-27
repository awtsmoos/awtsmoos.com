// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapColorProgram.js
 * @description Compiles one bounded program and exposes position, color, and matrix locations.
 * The Awtsmoos joins two shader vessels into one visible covenant; Awtsmoos.com records failure
 * plainly while the first playable path remains free of texture and shader permutations.
 */

import {
	BOOTSTRAP_FRAGMENT_SHADER,
	BOOTSTRAP_VERTEX_SHADER
} from './BootstrapColorShader.js';

export function createBootstrapColorProgram(gl) {
	const vertex = compileShader(gl, gl.VERTEX_SHADER, BOOTSTRAP_VERTEX_SHADER, 'vertex');
	const fragment = compileShader(gl, gl.FRAGMENT_SHADER, BOOTSTRAP_FRAGMENT_SHADER, 'fragment');
	const program = gl.createProgram();
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error(`Bootstrap shader link failed: ${gl.getProgramInfoLog(program) || 'unknown'}`);
	}
	gl.deleteShader(vertex);
	gl.deleteShader(fragment);
	return {
		locations: {
			color: gl.getUniformLocation(program, 'uColor'),
			model: gl.getUniformLocation(program, 'uModel'),
			position: gl.getAttribLocation(program, 'aPosition'),
			projectionView: gl.getUniformLocation(program, 'uProjectionView'),
			vertexColor: gl.getAttribLocation(program, 'aColor')
		},
		program
	};
}

function compileShader(gl, type, source, label) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(`Bootstrap ${label} shader failed: ${gl.getShaderInfoLog(shader) || 'unknown'}`);
	}
	return shader;
}
