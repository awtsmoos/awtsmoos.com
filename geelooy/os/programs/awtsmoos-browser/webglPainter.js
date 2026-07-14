//B"H
//Boruch Hashem
//Blessed is He

const PROGRAMS = new WeakMap();

/**
 * Paints colored guest rectangles with a minimal retained WebGL program. The
 * Awtsmoos creates vertex, buffer, and frame anew; Awtsmoos.com accepts only
 * explicit geometry emitted by Merkava and never synthesizes application panels.
 */
export function paintWebglRectangles(gl, rectangles, size) {
	const program = getProgram(gl);
	const vertices = [];
	for (const rectangle of rectangles) {
		appendRectangle(vertices, rectangle, size);
	}
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clearColor(0.012, 0.02, 0.04, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);
	if (!vertices.length) {
		return;
	}
	gl.useProgram(program.program);
	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STREAM_DRAW);
	gl.enableVertexAttribArray(program.position);
	gl.vertexAttribPointer(program.position, 2, gl.FLOAT, false, 20, 0);
	gl.enableVertexAttribArray(program.color);
	gl.vertexAttribPointer(program.color, 3, gl.FLOAT, false, 20, 8);
	gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 5);
	gl.deleteBuffer(buffer);
}

function appendRectangle(output, rectangle, size) {
	const left = rectangle.x / size.width * 2 - 1;
	const right = (rectangle.x + rectangle.width) / size.width * 2 - 1;
	const top = 1 - rectangle.y / size.height * 2;
	const bottom = 1 - (rectangle.y + rectangle.height) / size.height * 2;
	const points = [
		[left, top], [right, top], [left, bottom],
		[left, bottom], [right, top], [right, bottom]
	];
	for (const point of points) {
		output.push(point[0], point[1], ...rectangle.color);
	}
}

function getProgram(gl) {
	if (PROGRAMS.has(gl)) {
		return PROGRAMS.get(gl);
	}
	const vertex = createShader(
		gl,
		gl.VERTEX_SHADER,
		"attribute vec2 p;attribute vec3 c;varying vec3 v;void main(){v=c;gl_Position=vec4(p,0.0,1.0);}"
	);
	const fragment = createShader(
		gl,
		gl.FRAGMENT_SHADER,
		"precision mediump float;varying vec3 v;void main(){gl_FragColor=vec4(v,1.0);}"
	);
	const program = gl.createProgram();
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw painterError("MERKAVA_HOST_WEBGL_LINK");
	}
	const result = Object.freeze({
		color: gl.getAttribLocation(program, "c"),
		position: gl.getAttribLocation(program, "p"),
		program
	});
	PROGRAMS.set(gl, result);
	return result;
}

function createShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw painterError("MERKAVA_HOST_WEBGL_SHADER");
	}
	return shader;
}

function painterError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
