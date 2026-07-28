// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleWebGlProgram
 * @description
 * Persistent GPU buffers stream cinematic triangles and points into the exact
 * offscreen frame later composited into preview and MediaRecorder output.
 */

const SCENE_VERTEX = `attribute vec2 a_position;attribute vec4 a_color;uniform vec2 u_resolution;varying vec4 v_color;void main(){vec2 clip=(a_position/u_resolution)*2.0-1.0;gl_Position=vec4(clip*vec2(1.0,-1.0),0.0,1.0);v_color=a_color;}`;
const SCENE_FRAGMENT = `precision mediump float;varying vec4 v_color;void main(){gl_FragColor=v_color;}`;
const POINT_VERTEX = `attribute vec2 a_position;attribute vec4 a_color;attribute float a_size;uniform vec2 u_resolution;varying vec4 v_color;void main(){vec2 clip=(a_position/u_resolution)*2.0-1.0;gl_Position=vec4(clip*vec2(1.0,-1.0),0.0,1.0);gl_PointSize=a_size;v_color=a_color;}`;
const POINT_FRAGMENT = `precision mediump float;varying vec4 v_color;void main(){vec2 p=gl_PointCoord-vec2(.5);float a=smoothstep(.5,.12,length(p));gl_FragColor=vec4(v_color.rgb,v_color.a*a);}`;

export function createCinematicPrograms(gl) {
	return {
		points: createProgram(gl, POINT_VERTEX, POINT_FRAGMENT, ['a_position', 'a_color', 'a_size']),
		scene: createProgram(gl, SCENE_VERTEX, SCENE_FRAGMENT, ['a_position', 'a_color'])
	};
}

export function drawCinematicTriangles(gl, program, triangles, width, height) {
	const positions = [];
	const colors = [];
	for (const triangle of triangles) {
		for (const point of triangle.points) {
			positions.push(...point);
			colors.push(...triangle.color);
		}
	}
	useProgram(gl, program, width, height);
	streamAttribute(gl, program, 'a_position', positions, 2);
	streamAttribute(gl, program, 'a_color', colors, 4);
	gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
}

export function drawCinematicPoints(gl, program, points, width, height) {
	if (!points.length) return;
	useProgram(gl, program, width, height);
	streamAttribute(gl, program, 'a_position', points.flatMap(point => [point.x, point.y]), 2);
	streamAttribute(gl, program, 'a_color', points.flatMap(point => point.color), 4);
	streamAttribute(gl, program, 'a_size', points.map(point => point.size), 1);
	gl.drawArrays(gl.POINTS, 0, points.length);
}

export function destroyCinematicPrograms(gl, programs) {
	for (const value of Object.values(programs || {})) {
		for (const buffer of Object.values(value.buffers || {})) gl.deleteBuffer(buffer);
		if (value.program) gl.deleteProgram(value.program);
	}
}

function createProgram(gl, vertexSource, fragmentSource, attributes) {
	const program = gl.createProgram();
	gl.attachShader(program, shader(gl, gl.VERTEX_SHADER, vertexSource));
	gl.attachShader(program, shader(gl, gl.FRAGMENT_SHADER, fragmentSource));
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
	return {
		attributes: Object.fromEntries(attributes.map(name => [name, gl.getAttribLocation(program, name)])),
		buffers: Object.fromEntries(attributes.map(name => [name, gl.createBuffer()])),
		program,
		resolution: gl.getUniformLocation(program, 'u_resolution')
	};
}

function shader(gl, type, source) {
	const value = gl.createShader(type);
	gl.shaderSource(value, source);
	gl.compileShader(value);
	if (!gl.getShaderParameter(value, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(value));
	return value;
}

function useProgram(gl, value, width, height) {
	gl.useProgram(value.program);
	gl.uniform2f(value.resolution, width, height);
}

function streamAttribute(gl, program, name, values, size) {
	gl.bindBuffer(gl.ARRAY_BUFFER, program.buffers[name]);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(values), gl.DYNAMIC_DRAW);
	gl.enableVertexAttribArray(program.attributes[name]);
	gl.vertexAttribPointer(program.attributes[name], size, gl.FLOAT, false, 0, 0);
}
